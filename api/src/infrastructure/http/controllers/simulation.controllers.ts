import express, { Request, Response } from 'express';
import { StartSimulationUseCase } from "../../../application/user-cases/start-simulation.use-case";
import { DistributeSalariesUseCase } from '../../../application/user-cases/distribute-salary-use-case';
import { GetMarketStateUseCase } from '../../../application/user-cases/get-market-state.use-case';
import { GetPeopleStateUseCase } from '../../../application/user-cases/get-people-state.use-case';
import { GetSimulationDateUseCase } from '../../../application/user-cases/get-simulation-date.use-case';
import { AdvanceSimulationDayUseCase } from '../../../application/user-cases/advance-simulation-day.use-case';
import { runDailyTasks, SIM_DAY_INTERVAL_MS } from '../../scheduling/daily-tasks.job';
import { IMarketRepository } from '../../../application/ports/repository.ports';
import { PgCurrencyRepository } from '../../persistence/postgres/currency.repository';

export class SimulationController {
    private dailyJobInterval: NodeJS.Timeout | null = null;
    private simulationId?: number;
    private marketId?: number;
    private advanceSimulationDayUseCase: AdvanceSimulationDayUseCase;
    private currencyRepo: PgCurrencyRepository;

    constructor(
        private readonly startSimulationUseCase: StartSimulationUseCase,
        private readonly distributeSalariesUseCase: DistributeSalariesUseCase,
        private readonly getMarketStateUseCase: GetMarketStateUseCase,
        private readonly getPeopleStateUseCase: GetPeopleStateUseCase,
        private readonly getSimulationDateUseCase: GetSimulationDateUseCase,
        private readonly simulationRepo: any,
        private readonly marketRepo: IMarketRepository,
        private readonly populationRepo: any
    ) {
        this.advanceSimulationDayUseCase = new AdvanceSimulationDayUseCase(this.simulationRepo, this.marketRepo);
        this.currencyRepo = new PgCurrencyRepository();
    }

    public setupRoutes(app: express.Application): void {
        const router = express.Router();

        /**
         * @openapi
         * /simulation/start:
         *   post:
         *     summary: Start a new simulation
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               numberOfPeople:
         *                 type: integer
         *               initialFunds:
         *                 type: object
         *                 properties:
         *                   amount:
         *                     type: number
         *                   currency:
         *                     type: string
         *               baseSalary:
         *                 type: object
         *                 properties:
         *                   amount:
         *                     type: number
         *                   currency:
         *                     type: string
         *     responses:
         *       201:
         *         description: Simulation started successfully
         *       400:
         *         description: Missing required fields
         *       500:
         *         description: Failed to start simulation
         */
        router.post('/start', async (req: Request, res: Response) => {
            try {
                const { numberOfPeople, initialFunds, baseSalary } = req.body;
                
                // Basic validation
                if (!numberOfPeople || !initialFunds || !baseSalary) {
                    return res.status(400).json({ error: 'Missing required fields for simulation start.' });
                }

                const { simulationId, marketId } = await this.startSimulationUseCase.execute({
                    numberOfPeople,
                    initialFunds,
                    baseSalary
                });
                this.simulationId = simulationId;
                this.marketId = marketId;
                const simulation = await this.simulationRepo.findById(simulationId);
                // Start daily job if not already running
                if (!this.dailyJobInterval) {
                    const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket(marketId);
                    const machinesMarket = await this.marketRepo.findMachinesMarket(marketId);
                    const vehiclesMarket = await this.marketRepo.findVehiclesMarket(marketId);
                    
                    // const population = await this.populationRepo.find();
                    if (simulation && rawMaterialsMarket && machinesMarket && vehiclesMarket) {
                        const advanceDayUseCase = new AdvanceSimulationDayUseCase(
                            simulation,
                            this.marketRepo
                        );
                        this.dailyJobInterval = setInterval(async () => {
                            if (this.simulationId && this.marketId) {
                                try {
                                    await this.advanceSimulationDayUseCase.execute(this.simulationId, this.marketId);
                                    console.log('Simulation day advanced via scheduled job');
                                } catch (err) {
                                    console.error('Failed to advance simulation day:', err);
                                }
                            }
                        }, SIM_DAY_INTERVAL_MS);
                    }
                }

                res.status(201).json({ message: `Simulation started successfully and daily job started. Generated simulationId: ${simulation.id}, marketId: ${marketId}` });
            } catch (error: any) {
                console.error(error);
                res.status(500).json({ error: 'Failed to start simulation.', details: error.message });
            }
        });

        /**
         * @openapi
         * /simulation/salaries/distribute:
         *   post:
         *     summary: Distribute salaries to all people
         *     responses:
         *       200:
         *         description: Salary distribution process initiated
         *       500:
         *         description: Failed to distribute salaries
         */
        router.post('/salaries/distribute', async (req: Request, res: Response) => {
            try {
                await this.distributeSalariesUseCase.execute();
                res.status(200).json({ message: 'Salary distribution process initiated.' });
            } catch (error: any) {
                console.error(error);
                res.status(500).json({ error: 'Failed to distribute salaries.', details: error.message });
            }
        });

        /**
         * @openapi
         * /simulation/market:
         *   get:
         *     summary: Get current market state
         *     responses:
         *       200:
         *         description: Market state
         *       500:
         *         description: Error
         */
        router.get('/market', async (req, res) => {
            try {
                const marketId = Number(req.query.marketId);
                if (!marketId) {
                    return res.status(400).json({ error: 'Missing required marketId in query.' });
                }
                const state = await this.getMarketStateUseCase.execute(marketId);
                res.json(state);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        });

        /**
         * @openapi
         * /simulation/people:
         *   get:
         *     summary: Get people and their salaries
         *     responses:
         *       200:
         *         description: People state
         *       500:
         *         description: Error
         */
        router.get('/people', async (req, res) => {
            try {
                const state = await this.getPeopleStateUseCase.execute();
                res.json(state);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        });

        /**
         * @openapi
         * /simulation/date:
         *   get:
         *     summary: Get current simulation date
         *     responses:
         *       200:
         *         description: Simulation date
         *       500:
         *         description: Error
         */
        router.get('/date', async (req, res) => {
            try {
                // You may want to pass a simulationId from query or config
                const state = await this.getSimulationDateUseCase.execute(0);
                res.json(state);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        });

        /**
         * @openapi
         * /simulation/currencies:
         *   get:
         *     summary: Get all available currencies from the database
         *     responses:
         *       200:
         *         description: List of currencies
         *       500:
         *         description: Error
         */
        router.get('/currencies', async (req, res) => {
            try {
                const currencies = await this.currencyRepo.findAll();
                res.json({ currencies });
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        });

        /**
         * @openapi
         * /simulation/currencies/default:
         *   get:
         *     summary: Get the default currency from the database
         *     responses:
         *       200:
         *         description: Default currency
         *       500:
         *         description: Error
         */
        router.get('/currencies/default', async (req, res) => {
            try {
                const currency = await this.currencyRepo.getDefaultCurrency();
                if (!currency) {
                    return res.status(404).json({ error: 'Default currency not found' });
                }
                res.json({ currency });
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        });

        /**
         * @openapi
         * /simulation/market/buy-machine:
         *   post:
         *     summary: Buy a machine from the market
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               machineId:
         *                 type: string
         *     responses:
         *       200:
         *         description: Machine purchased
         *       400:
         *         description: Error
         *       404:
         *         description: Market not found
         */
        router.post('/market/buy-machine', async (req, res) => {
            try {
                const { marketId, machineId } = req.body;
                const machinesMarket = await this.marketRepo.findMachinesMarket(marketId);
                if (!machinesMarket) return res.status(404).json({ error: 'Machines market not found' });
                const machine = machinesMarket.sellMachine(machineId);
                await this.marketRepo.saveMachinesMarket(machinesMarket);
                res.json({ machine });
            } catch (err: any) {
                res.status(400).json({ error: err.message });
            }
        });

        /**
         * @openapi
         * /simulation/market/buy-vehicle:
         *   post:
         *     summary: Buy a vehicle from the market
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               vehicleId:
         *                 type: string
         *     responses:
         *       200:
         *         description: Vehicle purchased
         *       400:
         *         description: Error
         *       404:
         *         description: Market not found
         */
        router.post('/market/buy-vehicle', async (req, res) => {
            try {
                const { marketId, vehicleId } = req.body;
                const vehiclesMarket = await this.marketRepo.findVehiclesMarket(marketId);
                if (!vehiclesMarket) return res.status(404).json({ error: 'Vehicles market not found' });
                const vehicle = vehiclesMarket.sellVehicle(vehicleId);
                await this.marketRepo.saveVehiclesMarket(vehiclesMarket);
                res.json({ vehicle });
            } catch (err: any) {
                res.status(400).json({ error: err.message });
            }
        });

        /**
         * @openapi
         * /simulation/market/buy-raw-material:
         *   post:
         *     summary: Buy a raw material from the market
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               materialType:
         *                 type: string
         *               weightToSell:
         *                 type: object
         *                 properties:
         *                   value:
         *                     type: number
         *                   unit:
         *                     type: string
         *     responses:
         *       200:
         *         description: Raw material purchased
         *       400:
         *         description: Error
         *       404:
         *         description: Raw materials market not found
         */
        router.post('/market/buy-raw-material', async (req, res) => {
            try {
                const { marketId, materialType, weightToSell } = req.body;
                const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket(marketId);
                if (!rawMaterialsMarket) return res.status(404).json({ error: 'Raw materials market not found' });
                const result = await rawMaterialsMarket.sellRawMaterial(materialType, weightToSell);
                await this.marketRepo.saveRawMaterialsMarket(rawMaterialsMarket);
                res.json({ transaction: result });
            } catch (err: any) {
                res.status(400).json({ error: err.message });
            }
        });

        /**
         * @openapi
         * /simulation/market/machines:
         *   get:
         *     summary: Get all machines for sale in the market
         *     responses:
         *       200:
         *         description: List of machines
         *       404:
         *         description: Machines market not found
         */
        router.get('/market/machines', async (req, res) => {
            try {
                const marketId = Number(req.query.marketId);
                if (!marketId) {
                    return res.status(400).json({ error: 'Missing required marketId in query.' });
                }
                const machinesMarket = await this.marketRepo.findMachinesMarket(marketId);
                if (!machinesMarket) return res.status(404).json({ error: 'Machines market not found' });
                const machines = machinesMarket.getMachinesForSale();
                // Group by type and count
                const grouped = machines.reduce((acc: Record<string, { quantity: number, machines: any[] }>, m: any) => {
                    if (!acc[m.type]) acc[m.type] = { quantity: 0, machines: [] };
                    acc[m.type].quantity++;
                    acc[m.type].machines.push(m);
                    return acc;
                }, {} as Record<string, { quantity: number, machines: any[] }>);
                res.json(grouped);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        });

        /**
         * @openapi
         * /simulation/market/vehicles:
         *   get:
         *     summary: Get all vehicles for sale in the market
         *     responses:
         *       200:
         *         description: List of vehicles
         *       404:
         *         description: Vehicles market not found
         */
        router.get('/market/vehicles', async (req, res) => {
            try {
                const marketId = Number(req.query.marketId);
                if (!marketId) {
                    return res.status(400).json({ error: 'Missing required marketId in query.' });
                }
                const vehiclesMarket = await this.marketRepo.findVehiclesMarket(marketId);
                if (!vehiclesMarket) return res.status(404).json({ error: 'Vehicles market not found' });
                const vehicles = vehiclesMarket.getVehiclesForSale();
                // Group by type and count
                const grouped = vehicles.reduce((acc: Record<string, { quantity: number, vehicles: any[] }>, v: any) => {
                    if (!acc[v.type]) acc[v.type] = { quantity: 0, vehicles: [] };
                    acc[v.type].quantity++;
                    acc[v.type].vehicles.push(v);
                    return acc;
                }, {} as Record<string, { quantity: number, vehicles: any[] }>);
                res.json(grouped);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        });

        /**
         * @openapi
         * /simulation/market/raw-materials:
         *   get:
         *     summary: Get all raw materials in the market
         *     responses:
         *       200:
         *         description: List of raw materials
         *       404:
         *         description: Raw materials market not found
         */
        router.get('/market/raw-materials', async (req, res) => {
            try {
                const { marketId } = req.query;
                if (!marketId) {
                    
                }
                const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket(Number(marketId));
                if (!rawMaterialsMarket) return res.status(404).json({ error: 'Raw materials market not found' });
                res.json({ rawMaterials: rawMaterialsMarket.getRawMaterials() });
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        });

        app.use('/simulation', router);
    }
}
