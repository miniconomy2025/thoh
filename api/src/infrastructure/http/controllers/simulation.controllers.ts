import express, { Request, Response } from 'express';
import { IMarketRepository } from '../../../application/ports/repository.ports';
import { AdvanceSimulationDayUseCase } from '../../../application/user-cases/advance-simulation-day.use-case';
import { BreakPhonesUseCase } from '../../../application/user-cases/break-phones.use-case';
import { CollectItemInput, CollectItemUseCase, LogisticsInput } from '../../../application/user-cases/collect-item.use-case';
import { GetBankInitializationUseCase } from '../../../application/user-cases/get-bank-initialization.use-case';
import { GetCollectionsUseCase } from '../../../application/user-cases/get-collections.use-case';
import { GetMachinesUseCase } from '../../../application/user-cases/get-machines.use-case';
import { GetOrdersUseCase } from '../../../application/user-cases/get-orders.use-case';
import { GetPeopleStateUseCase } from '../../../application/user-cases/get-people-state.use-case';
import { GetRawMaterialsUseCase } from '../../../application/user-cases/get-raw-materials.use-case';
import { GetTrucksUseCase } from '../../../application/user-cases/get-trucks.use-case';
import { PayOrderUseCase } from '../../../application/user-cases/pay-order.use-case';
import { PurchaseMachineUseCase } from '../../../application/user-cases/purchase-machine.use-case';
import { PurchaseRawMaterialUseCase } from '../../../application/user-cases/purchase-raw-material.use-case';
import { PurchaseTruckUseCase } from '../../../application/user-cases/purchase-truck.use-case';
import { RecyclePhonesUseCase } from '../../../application/user-cases/recycle-phones.use-case';
import { StartSimulationUseCase } from "../../../application/user-cases/start-simulation.use-case";
import { StopSimulationUseCase } from '../../../application/user-cases/stop-simulation.use-case';
import { Phone } from '../../../domain/population/phone.entity';
import { PgCurrencyRepository } from '../../persistence/postgres/currency.repository';
import { PersonRepository } from '../../persistence/postgres/person.repository';
import { PhoneStaticRepository } from '../../persistence/postgres/phone-static.repository';
import { PhoneRepository } from '../../persistence/postgres/phone.repository';
import { SIM_DAY_INTERVAL_MS } from '../../scheduling/daily-tasks.job';

import { BuyPhoneUseCase } from '../../../application/user-cases/buy-phone-use-case';
import { ReceivePhoneUseCase } from '../../../application/user-cases/recieve-phone-use-case';
import { Chart, KeyValueCache, Month } from '../../../domain/shared/value-objects';
import { MutexWrapper } from '../../concurrency';
import { calculateDaysElapsed, getScaledDate } from '../../utils';
import { RetrieveAccountsUseCase } from '../../../application/user-cases/retrieve-accounts-use-case';

export class SimulationController {
    private dailyJobInterval: NodeJS.Timeout | null = null;
    private simulationId?: number;
    private advanceSimulationDayUseCase: AdvanceSimulationDayUseCase;
    private currencyRepo: PgCurrencyRepository;
    private getBankInitializationUseCase: GetBankInitializationUseCase;

    private simulationStartDate = new MutexWrapper<Date>(new Date());
    private totalTrades = new MutexWrapper<number>(0);
    private activities = new MutexWrapper<{ id: string; time: string; description: string; amount: number }[]>([]);
    private machinery = new MutexWrapper<KeyValueCache<Month, Chart>>(new KeyValueCache<Month, Chart>());
    private trucks = new MutexWrapper<KeyValueCache<Month, Chart>>(new KeyValueCache<Month, Chart>());
    private rawMaterials = new MutexWrapper<KeyValueCache<Month, Chart>>(new KeyValueCache<Month, Chart>());

    constructor(
        private readonly startSimulationUseCase: StartSimulationUseCase,
        private readonly stopSimulationUseCase: StopSimulationUseCase,
        private readonly getPeopleStateUseCase: GetPeopleStateUseCase,
        private readonly getMachinesUseCase: GetMachinesUseCase,
        private readonly getTrucksUseCase: GetTrucksUseCase,
        private readonly getRawMaterialsUseCase: GetRawMaterialsUseCase,
        private readonly purchaseMachineUseCase: PurchaseMachineUseCase,
        private readonly purchaseTruckUseCase: PurchaseTruckUseCase,
        private readonly purchaseRawMaterialUseCase: PurchaseRawMaterialUseCase,
        private readonly getOrdersUseCase: GetOrdersUseCase,
        private readonly payOrderUseCase: PayOrderUseCase,
        private readonly getCollectionsUseCase: GetCollectionsUseCase,
        private readonly collectItemUseCase: CollectItemUseCase,
        private readonly simulationRepo: unknown,
        private readonly marketRepo: IMarketRepository,
        private readonly breakPhonesUseCase: BreakPhonesUseCase,
        private readonly receivePhoneUseCase: ReceivePhoneUseCase,
        private readonly buyPhoneUseCase: BuyPhoneUseCase,
        private readonly retrieveAccountUseCase: RetrieveAccountsUseCase
    ) {
        this.advanceSimulationDayUseCase = new AdvanceSimulationDayUseCase(this.simulationRepo as any, this.marketRepo, this.breakPhonesUseCase,this.buyPhoneUseCase);
        this.currencyRepo = new PgCurrencyRepository();
        this.getBankInitializationUseCase = new GetBankInitializationUseCase();
    }

    private mapLogisticsToCollection(logisticsInput: LogisticsInput): CollectItemInput {
      
      let totalQuantity = 0;

      for (const item of logisticsInput.items) {
        if (item.name.includes("machine")) {
          return {
            orderId: parseInt(logisticsInput.id),
            collectQuantity: logisticsInput.items.length,
          };
        }

        totalQuantity += item.quantity;
      }

      return {
        orderId: parseInt(logisticsInput.id),
        collectQuantity: totalQuantity,
      };
    }

    private validateSimulationRunning(res: Response): boolean {
        if (!this.simulationId) {
            res.status(400).json({ 
                error: 'Simulation is not running. Please start a simulation first using POST /simulations' 
            });
            return false;
        }
        return true;
    }

    public setupRoutes(app: express.Application): void {
        const router = express.Router();

        /**
         * @openapi
         * /simulations:
         *   post:
         *     summary: Start a new simulation
         *     tags:
         *       - Private Endpoints
         *     responses:
         *       201:
         *         description: Simulation started successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 message:
         *                   type: string
         *                   example: Simulation started successfully and daily job started. Generated simulationId 1
         *                 simulationId:
         *                   type: integer
         *                   example: 1
         *       500:
         *         description: Failed to start simulation
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Failed to start simulation.
         *                 details:
         *                   type: string
         *                   example: Some error message
         */
        router.post('/simulations', async (req: Request, res: Response) => {
            try {
                const { simulationId } = await this.startSimulationUseCase.execute();
                this.simulationId = simulationId;
                const simulation = await (this.simulationRepo as any).findById(simulationId);
                
                // Start daily job if not already running
                if (!this.dailyJobInterval) {
                    this.dailyJobInterval = setInterval(async () => {
                        if (this.simulationId) {
                            try {
                                const simulation = await (this.simulationRepo as any).findById(this.simulationId);
                                if (!simulation) return;

                                // Calculate how many days should have passed based on real time
                                const elapsedRealMs = Date.now() - simulation.getUnixEpochStartTime();
                                const SIM_DAY_MS = 2 * 60 * 1000; // 2 minutes in milliseconds
                                const expectedDays = Math.floor(elapsedRealMs / SIM_DAY_MS) + 1;

                                // Only advance if we're behind
                                if (simulation.currentDay < expectedDays) {
                                    await this.advanceSimulationDayUseCase.execute(this.simulationId);
                                }
                            } catch (err: unknown) {
                                console.error('Failed to advance simulation day:', err);
                            }
                        }
                    }, 1000); // Check more frequently but only advance when needed
                }

                await this.simulationStartDate.update(async () => new Date());
                res.status(201).json({ message: `Simulation started successfully and daily job started. Generated simulationId: ${simulation.id}`, simulationId });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to start simulation.', details: (error as Error).message });
            }
        });

        /**
         * @openapi
         * /simulations:
         *   get:
         *     summary: Get the current simulation ID
         *     tags:
         *       - Simulations
         *     responses:
         *       200:
         *         description: Current simulation ID
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 message:
         *                   type: string
         *                   example: Simulation is running. Current simulationId 1
         *                 simulationId:
         *                   type: integer
         *                   example: 1
         *       404:
         *         description: Simulation not running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation is not running. Please start a simulation first using POST /simulations
         */
        router.get('/simulations', async (req, res) => {
            if (!this.simulationId) {
                res.status(404).json({ error: 'Simulation is not running. Please start a simulation first using POST /simulations' });
            } else {
                res.status(200).json({ message: `Simulation is running. Current simulationId: ${this.simulationId}`, simulationId: this.simulationId });
            }
        });

        /**
         * @openapi
         * /people:
         *   get:
         *     summary: Get people and their salaries
         *     tags:
         *       - Private Endpoints
         *     responses:
         *       200:
         *         description: People state
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 people:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       id:
         *                         type: integer
         *                         example: 1
         *                       salary:
         *                         type: number
         *                         example: 50000
         *                       phone:
         *                         type: object
         *                         nullable: true
         *                         properties:
         *                           id:
         *                             type: integer
         *                             example: 10
         *                           isBroken:
         *                             type: boolean
         *                             example: false
         *                           model:
         *                             type: object
         *                             nullable: true
         *                             properties:
         *                               id:
         *                                 type: integer
         *                                 example: 2
         *                               name:
         *                                 type: string
         *                                 example: ePhone
         *                       phoneWorking:
         *                         type: boolean
         *                         example: true
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while retrieving people state
         */
        router.get('/people', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const state = await this.getPeopleStateUseCase.execute();
                console.log('GET /people response:', state);
                res.json(state);
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /people/phones:
         *   post:
         *     summary: Purchase a phone for a person
         *     tags:
         *       - Private Endpoints
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - personId
         *               - phoneName
         *             properties:
         *               personId:
         *                 type: integer
         *                 example: 1
         *               phoneName:
         *                 type: string
         *                 example: ePhone
         *     responses:
         *       200:
         *         description: Phone purchased successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 message:
         *                   type: string
         *                   example: Person 1 successfully purchased phone 'ePhone'
         *                 personId:
         *                   type: integer
         *                   example: 1
         *                 phoneId:
         *                   type: integer
         *                   example: 10
         *       400:
         *         description: Invalid request
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: personId (number, in URL or body) and phoneName (string, in body) are required
         *       404:
         *         description: Person or Phone model not found
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Person with id 1 not found
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while purchasing phone
         */
        router.post('/people/phones', async (req, res) => {
            const { phoneName, personId } = req.body;
            if (!personId || isNaN(personId) || !phoneName || typeof phoneName !== 'string') {
                return res.status(400).json({ error: 'personId (number, in URL or body) and phoneName (string, in body) are required' });
            }
            try {
                // Find the phone model
                const phoneModel = await PhoneStaticRepository.getRepo().findOne({ where: { name: phoneName } });
                if (!phoneModel) {
                    return res.status(404).json({ error: `Phone model '${phoneName}' not found` });
                }
                // Create the phone
                const phone = new Phone();
                phone.model = phoneModel;
                phone.isBroken = false;
                await PhoneRepository.prototype.save.call({ repo: PhoneRepository.getRepo() }, phone);
                // Minimal update: set phoneId for the person
                const updateResult = await PersonRepository.getRepo().update({ id: personId }, { phone: { id: phone.id } });
                if (updateResult.affected === 0) {
                    return res.status(404).json({ error: `Person with id ${personId} not found` });
                }
                // Extra logging: fetch and log the updated person
                const updatedPerson = await PersonRepository.getRepo().findOne({ where: { id: personId }, relations: ['phone', 'phone.model'] });
                console.log('After phone purchase, updated person:', updatedPerson);
                res.json({ message: `Person ${personId} successfully purchased phone '${phoneName}'`, personId, phoneId: phone.id });
            } catch (err) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /time:
         *   get:
         *     summary: Get the Unix epoch timestamp when the simulation started
         *     tags:
         *       - Simulations
         *     responses:
         *       200:
         *         description: Unix epoch start time
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 unixEpochStartTime:
         *                   type: number
         *                   example: 1710864000000
         *       400:
         *         description: Simulation not running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation is not running. Please start a simulation first using POST /simulations
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation not found
         */
        router.get('/time', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const simulation = await (this.simulationRepo as any).findById(this.simulationId!);
                if (!simulation) {
                    throw new Error('Simulation not found');
                }
                res.json({ epochStartTime: simulation.getUnixEpochStartTime() });
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });
        
        
        /**
         * @openapi
         * /current-simulation-time:
         *   get:
         *     summary: Get the current in-simulation date and time
         *     tags:
         *       - Simulations
         *     responses:
         *       200:
         *         description: Current simulation date and time
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 simulationDate:
         *                   type: string
         *                   example: "2050-01-15"
         *                 simulationTime:
         *                   type: string
         *                   example: "13:45:30"
         *                 simulationDay:
         *                   type: number
         *                   example: 15
         *       400:
         *         description: Simulation not running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation is not running. Please start a simulation first using POST /simulations
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation not found
         */
        router.get('/current-simulation-time', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const simulation = await (this.simulationRepo as any).findById(this.simulationId!);
                if (!simulation) {
                    throw new Error('Simulation not found');
                }
                
                res.json({
                    simulationDate: simulation.getCurrentSimDateString(),
                    simulationTime: simulation.getCurrentSimTime(),
                    simulationDay: simulation.currentDay
                });
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /machines:
         *   get:
         *     summary: Get machines for sale (grouped by type)
         *     tags:
         *       - Market
         *     responses:
         *       200:
         *         description: List of machines (grouped by type with averaged values)
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 machines:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       machineName:
         *                         type: string
         *                         example: electronics_machine
         *                       inputs:
         *                         type: string
         *                         nullable: true
         *                         example: copper,plastic
         *                       quantity:
         *                         type: integer
         *                         example: 5
         *                       inputRatio:
         *                         type: object
         *                         additionalProperties:
         *                           type: number
         *                         example: { "copper": 2, "plastic": 1 }
         *                       productionRate:
         *                         type: number
         *                         example: 500
         *                       price:
         *                         type: number
         *                         example: 10000
         *       400:
         *         description: Simulation not running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation is not running. Please start a simulation first using POST /simulations
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while retrieving machines
         */
        router.get('/machines', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const result = await this.getMachinesUseCase.execute();
                res.json(result);
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /trucks:
         *   get:
         *     summary: Get trucks for sale (grouped by type)
         *     tags:
         *       - Market
         *     responses:
         *       200:
         *         description: List of trucks (grouped by type with averaged values)
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: object
         *                 properties:
         *                   truckName:
         *                     type: string
         *                     example: large_truck
         *                   description:
         *                     type: string
         *                     nullable: true
         *                     example: Heavy duty truck for large loads
         *                   price:
         *                     type: number
         *                     example: 25000
         *                   quantity:
         *                     type: integer
         *                     example: 3
         *                   operatingCost:
         *                     type: number
         *                     example: 500
         *                   maximumLoad:
         *                     type: number
         *                     example: 10000
         *       400:
         *         description: Simulation not running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation is not running. Please start a simulation first using POST /simulations
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while retrieving trucks
         */
        router.get('/trucks', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const result = await this.getTrucksUseCase.execute();
                res.json(result);
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /raw-materials:
         *   get:
         *     summary: Get raw materials (grouped by type)
         *     tags:
         *       - Market
         *     responses:
         *       200:
         *         description: List of raw materials (grouped by type with aggregated values)
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: object
         *                 properties:
         *                   rawMaterialName:
         *                     type: string
         *                     example: copper
         *                   description:
         *                     type: string
         *                     nullable: true
         *                     example: High quality copper
         *                   pricePerKg:
         *                     type: number
         *                     example: 12.5
         *                   quantityAvailable:
         *                     type: integer
         *                     example: 1000
         *       400:
         *         description: Simulation not running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation is not running. Please start a simulation first using POST /simulations
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while retrieving raw materials
         */
        router.get('/raw-materials', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const result = await this.getRawMaterialsUseCase.execute();
                res.json(result);
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /orders:
         *   get:
         *     summary: Get all orders
         *     tags:
         *       - Market Orders
         *     responses:
         *       200:
         *         description: List of all orders
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: object
         *                 properties:
         *                   orderId:
         *                     type: integer
         *                     example: 1
         *                   itemName:
         *                     type: string
         *                     example: copper
         *                   itemId:
         *                     type: integer
         *                     nullable: true
         *                     example: 101
         *                   quantity:
         *                     type: number
         *                     example: 10
         *                   unitPrice:
         *                     type: number
         *                     example: 12.5
         *                   totalPrice:
         *                     type: number
         *                     example: 125
         *                   currency:
         *                     type: string
         *                     example: USD
         *                   orderDate:
         *                     type: string
         *                     format: date-time
         *                     example: 2024-05-01T12:00:00Z
         *                   status:
         *                     type: string
         *                     example: pending
         *                   item_type_id:
         *                     type: integer
         *                     nullable: true
         *                     example: 2
         *                   marketId:
         *                     type: integer
         *                     nullable: true
         *                     example: 5
         *       400:
         *         description: Simulation not running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation is not running. Please start a simulation first using POST /simulations
         *       500:
         *         description: Error retrieving orders
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while retrieving orders
         */
        router.get('/orders', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const result = await this.getOrdersUseCase.execute();
                res.json(result);
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /machines:
         *   post:
         *     summary: Create a new order for a machine
         *     tags:
         *       - Market Orders
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - machineName
         *               - quantity
         *             properties:
         *               machineName:
         *                 type: string
         *                 example: electronics_machine
         *               quantity:
         *                 type: integer
         *                 example: 2
         *     responses:
         *       200:
         *         description: Machine order created
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 orderId:
         *                   type: integer
         *                   example: 1
         *                 machineName:
         *                   type: string
         *                   example: electronics_machine
         *                 totalPrice:
         *                   type: number
         *                   example: 20000
         *                 unitWeight:
         *                   type: number
         *                   example: 100
         *                 totalWeight:
         *                   type: number
         *                   example: 200
         *                 quantity:
         *                   type: integer
         *                   example: 2
         *                 machineDetails:
         *                   type: object
         *                   properties:
         *                     requiredMaterials:
         *                       type: string
         *                       example: copper,plastic
         *                     inputRatio:
         *                       type: object
         *                       additionalProperties:
         *                         type: number
         *                       example: { "copper": 2, "plastic": 1 }
         *                     productionRate:
         *                       type: number
         *                       example: 500
         *                 bankAccount:
         *                   type: string
         *                   example: 123456789
         *       400:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Invalid request or simulation not running
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while creating machine order
         */
        router.post('/machines', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const { machineName, quantity } = req.body;
                
                // Get current simulation date
                let simulationDate: Date | undefined;
                if (this.simulationId) {
                    const simulation = await (this.simulationRepo as any).findById(this.simulationId);
                    if (simulation) {
                        simulationDate = simulation.getCurrentSimDate();
                    }
                }
                
                const result = await this.purchaseMachineUseCase.execute({ 
                    machineName, 
                    quantity,
                    simulationDate
                });

                const simulationStartDate = await this.simulationStartDate.read((date) => date);
                await this.machinery.update((machinery) => {
                    const dateOfPurchase = getScaledDate(simulationStartDate, new Date());
                    const machine = machinery.get(dateOfPurchase.month);
    
                    machinery.set(
                        dateOfPurchase.month,
                        machine ?
                        {
                            ...machine,
                            purchases: machine.purchases + 1
                        }
                        :
                        {
                            purchases: 1,
                            collections: 0,
                            measure: dateOfPurchase.month
                        }
                    )
                    return machinery

                });
                res.json(result);
            } catch (err: unknown) {
                res.status(400).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /trucks:
         *   post:
         *     summary: Create a new order for a truck
         *     tags:
         *       - Market Orders
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - truckName
         *               - quantity
         *             properties:
         *               truckName:
         *                 type: string
         *                 example: large_truck
         *               quantity:
         *                 type: integer
         *                 example: 2
         *     responses:
         *       200:
         *         description: Truck order created
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 orderId:
         *                   type: integer
         *                   example: 1
         *                 truckName:
         *                   type: string
         *                   example: large_truck
         *                 totalPrice:
         *                   type: number
         *                   example: 50000
         *                 unitWeight:
         *                   type: number
         *                   example: 2000
         *                 totalWeight:
         *                   type: number
         *                   example: 4000
         *                 quantity:
         *                   type: integer
         *                   example: 2
         *                 maximumLoad:
         *                   type: number
         *                   example: 10000
         *                 operatingCostPerDay:
         *                   type: string
         *                   example: "500"
         *                 bankAccount:
         *                   type: string
         *                   example: 123456789
         *       400:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Invalid request or simulation not running
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while creating truck order
         */
        router.post('/trucks', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const { truckName, quantity } = req.body;
                
                let simulationDate: Date | undefined;
                if (this.simulationId) {
                    const simulation = await (this.simulationRepo as any).findById(this.simulationId);
                    if (simulation) {
                        simulationDate = simulation.getCurrentSimDate();
                    }
                }
                
                const result = await this.purchaseTruckUseCase.execute({ 
                    truckName, 
                    quantity,
                    simulationDate
                });

                const simulationStartDate = await this.simulationStartDate.read((date) => date);
                await this.trucks.update((trucks) => {
                    const dateOfPurchase = getScaledDate(simulationStartDate, new Date());
                    const truck = trucks.get(dateOfPurchase.month);

                    trucks.set(
                        dateOfPurchase.month,
                        truck ?
                        {
                            ...truck,
                            purchases: truck.purchases + 1
                        }
                        :
                        {
                            purchases: 1,
                            collections: 0,
                            measure: dateOfPurchase.month
                        }
                    )
                    return trucks
                })
                res.json(result);
            } catch (err: unknown) {
                res.status(400).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /raw-materials:
         *   post:
         *     summary: Create a new order for raw material
         *     tags:
         *       - Market Orders
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - materialName
         *               - weightQuantity
         *             properties:
         *               materialName:
         *                 type: string
         *                 example: copper
         *               weightQuantity:
         *                 type: number
         *                 example: 100
         *     responses:
         *       200:
         *         description: Raw material order created (pending - inventory will be reduced when paid)
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 orderId:
         *                   type: integer
         *                   example: 1
         *                 materialName:
         *                   type: string
         *                   example: copper
         *                 weightQuantity:
         *                   type: number
         *                   example: 100
         *                 price:
         *                   type: number
         *                   example: 1250
         *                 bankAccount:
         *                   type: string
         *                   example: 123456789
         *       400:
         *         description: Error, insufficient inventory, or simulation not running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Invalid request, insufficient inventory, or simulation not running
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while creating raw material order
         */
        router.post('/raw-materials', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const { materialName, weightQuantity } = req.body;

                if(weightQuantity <= 0 || !weightQuantity) {
                    throw new Error('Weight quantity must be greater than 0');
                }
                
                // Get current simulation date
                let simulationDate: Date | undefined;
                if (this.simulationId) {
                    const simulation = await (this.simulationRepo as any).findById(this.simulationId);
                    if (simulation) {
                        simulationDate = simulation.getCurrentSimDate();
                    }
                }
                
                const result = await this.purchaseRawMaterialUseCase.execute({ 
                    materialName, 
                    weightQuantity,
                    simulationDate
                });

                const simulationStartDate = await this.simulationStartDate.read((date) => date);
                await this.rawMaterials.update((rawMaterials) => {
                    const dateOfPurchase = getScaledDate(simulationStartDate, new Date());
                    const rawMaterial = rawMaterials.get(dateOfPurchase.month);
    
                    rawMaterials.set(
                        dateOfPurchase.month,
                        rawMaterial ?
                        {
                            ...rawMaterial,
                            purchases: rawMaterial.purchases + 1
                        }
                        :
                        {
                            purchases: 1,
                            collections: 0,
                            measure: dateOfPurchase.month
                        }
                    )
                    return rawMaterials
                })

                res.json(result);
            } catch (err: unknown) {
                res.status(400).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /orders/payments:
         *   post:
         *     summary: Pay for and fulfill an order
         *     tags:
         *       - Market Orders
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - description
         *             properties:
         *               description:
         *                 type: string
         *                 example: 1
         *               companyName:
         *                 type: string
         *                 example: Acme Corp
         *     responses:
         *       200:
         *         description: Order paid and fulfilled successfully
         *         content:
         *           application/json:
         *             schema:
         *               oneOf:
         *                 - type: object
         *                   properties:
         *                     orderId:
         *                       type: integer
         *                       example: 1
         *                     itemName:
         *                       type: string
         *                       example: copper
         *                     quantity:
         *                       type: number
         *                       example: 10
         *                     totalPrice:
         *                       type: number
         *                       example: 125
         *                     status:
         *                       type: string
         *                       example: completed
         *                     message:
         *                       type: string
         *                       example: Order fulfilled successfully
         *                     canFulfill:
         *                       type: boolean
         *                       example: true
         *                     availableQuantity:
         *                       type: number
         *                       nullable: true
         *                       example: 5
         *                 - type: object
         *                   properties:
         *                     orderId:
         *                       type: integer
         *                       example: 1
         *                     itemName:
         *                       type: string
         *                       example: copper
         *                     quantity:
         *                       type: number
         *                       example: 10
         *                     totalPrice:
         *                       type: number
         *                       example: 125
         *                     status:
         *                       type: string
         *                       example: completed
         *                     message:
         *                       type: string
         *                       example: Order fulfilled successfully
         *       400:
         *         description: Invalid request or order already completed/cancelled
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Invalid request or order already completed/cancelled
         *       404:
         *         description: Order not found
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Order not found
         *       500:
         *         description: Error processing payment
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while processing payment
         */
        router.post('/orders/payments', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const { description, companyName } = req.body;
                
                if (!description) {
                    return res.status(400).json({ error: 'description is required' });
                }
                
                const result = await this.payOrderUseCase.execute({ orderId:Number(description),companyName:companyName });

                if(result.canFulfill){
                    await this.totalTrades.update((trades) => trades + 1);
                    await this.activities.update((activities) => {
                        const activity = {
                            id: `${result.orderId}`,
                            time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
                            description: `${result.itemName} (${result.quantity} ${result.itemName === 'Raw Material' ? 'kg' : 'units'}) for Đ${result.totalPrice.toFixed(2)}`,
                            amount: result.totalPrice
                        };
                        return [activity, ...activities.slice(0, 9)];
                    });
                }

                res.json(result);
            } catch (err: unknown) {
                if ((err as Error).message.includes('not found')) {
                    res.status(404).json({ error: (err as Error).message });
                } else if ((err as Error).message.includes('already completed') || (err as Error).message.includes('cancelled')) {
                    res.status(400).json({ error: (err as Error).message });
                } else {
                    res.status(500).json({ error: (err as Error).message });
                }
            }
        });

        /**
         * @openapi
         * /collections:
         *   get:
         *     summary: Get all collections (items awaiting pickup)
         *     tags:
         *       - Market Orders
         *     responses:
         *       200:
         *         description: List of all collections
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: object
         *                 properties:
         *                   quantity:
         *                     type: number
         *                     example: 10
         *                   amountCollected:
         *                     type: number
         *                     example: 5
         *                   id:
         *                     type: integer
         *                     example: 1
         *                   orderId:
         *                     type: integer
         *                     example: 1
         *                   itemName:
         *                     type: string
         *                     example: copper
         *                   itemId:
         *                     type: integer
         *                     example: 101
         *                   orderDate:
         *                     type: string
         *                     format: date-time
         *                     example: 2024-05-01T12:00:00Z
         *                   collected:
         *                     type: boolean
         *                     example: false
         *                   collectionDate:
         *                     type: string
         *                     format: date-time
         *                     nullable: true
         *                     example: 2024-05-02T12:00:00Z
         *       400:
         *         description: Simulation not running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation is not running. Please start a simulation first using POST /simulations
         *       500:
         *         description: Error retrieving collections
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while retrieving collections
         */
        router.get('/collections', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const result = await this.getCollectionsUseCase.execute();
                res.json(result);
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /logistics:
         *   post:
         *     summary: Mark an item as collected (partial or full)
         *     tags:
         *       - Market Orders
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - orderId
         *               - collectQuantity
         *             properties:
         *               orderId:
         *                 type: integer
         *                 example: 1
         *               collectQuantity:
         *                 type: number
         *                 example: 5
         *     responses:
         *       200:
         *         description: Item collected successfully (partial or full)
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 orderId:
         *                   type: integer
         *                   example: 1
         *                 quantityRemaining:
         *                   type: number
         *                   example: 5
         *       400:
         *         description: Invalid request, item already collected, or simulation not running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Invalid request, item already collected, or simulation not running
         *       404:
         *         description: Collection not found
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Collection not found
         *       500:
         *         description: Error processing collection
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while processing collection
         */
        router.post('/logistics', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const { orderId, collectQuantity } = this.mapLogisticsToCollection(req.body);
                
                if (!orderId || typeof orderId !== 'number') {
                    return res.status(400).json({ error: 'orderId is required and must be a number' });
                }
                
                const result = await this.collectItemUseCase.execute({ orderId, collectQuantity });
                res.json(result);
            } catch (err: unknown) {
                if ((err as Error).message.includes('not found')) {
                    res.status(404).json({ error: (err as Error).message });
                } else if ((err as Error).message.includes('already been collected')) {
                    res.status(400).json({ error: (err as Error).message });
                } else {
                    res.status(500).json({ error: (err as Error).message });
                }
            }
        });

        const recyclePhonesUseCase = new RecyclePhonesUseCase();
        /**
         * @openapi
         * /recycled-phones:
         *   get:
         *     summary: Get all recycled (broken) phones grouped by model
         *     tags:
         *       - Recycling
         *     responses:
         *       200:
         *         description: List of recycled phones grouped by model
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: object
         *                 properties:
         *                   modelId:
         *                     type: integer
         *                     example: 1
         *                   modelName:
         *                     type: string
         *                     example: ePhone
         *                   quantity:
         *                     type: integer
         *                     example: 5
         *       400:
         *         description: Invalid request
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Invalid request
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while retrieving recycled phones
         */
        router.get('/recycled-phones', async (req, res) => {
            try {
                const grouped = await recyclePhonesUseCase.listGroupedByModel();
                res.json(grouped);
            } catch (err) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /recycled-phones-collect:
         *   post:
         *     summary: Collect recycled phones by model name and quantity
         *     tags:
         *       - Recycling
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - modelName
         *               - quantity
         *             properties:
         *               modelName:
         *                 type: string
         *                 example: ePhone
         *               quantity:
         *                 type: integer
         *                 example: 3
         *     responses:
         *       200:
         *         description: Number of phones collected and remaining
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 collected:
         *                   type: integer
         *                   example: 3
         *                 remaining:
         *                   type: integer
         *                   example: 2
         *       400:
         *         description: Invalid request
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Invalid request
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while collecting recycled phones
         */
        router.post('/recycled-phones-collect', async (req, res) => {
            const { modelName, quantity } = req.body;
            if (!modelName || typeof modelName !== 'string' || !quantity || typeof quantity !== 'number') {
                return res.status(400).json({ error: 'modelName (string) and quantity (number) are required' });
            }
            try {
                const result = await recyclePhonesUseCase.collectByModelName(modelName, quantity);
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /stop:
         *   post:
         *     summary: Stop the current simulation
         *     tags:
         *       - Private Endpoints
         *     responses:
         *       200:
         *         description: Simulation stopped successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 message:
         *                   type: string
         *                   example: Simulation stopped successfully
         *       400:
         *         description: No simulation running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation is not running. Please start a simulation first using POST /simulations
         *       500:
         *         description: Error stopping simulation
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while stopping simulation
         */
        router.post('/stop', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                await this.stopSimulationUseCase.execute(this.simulationId!);
                
                // Clear the daily job interval
                if (this.dailyJobInterval) {
                    clearInterval(this.dailyJobInterval);
                    this.dailyJobInterval = null;
                }
                
                // Clear the simulation ID
                this.simulationId = undefined;
                
                res.json({ message: 'Simulation stopped successfully' });
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /bank/initialization:
         *   get:
         *     summary: Get bank initialization data
         *     tags:
         *       - Banking
         *     responses:
         *       200:
         *         description: Bank initialization data
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 primeRate:
         *                   type: number
         *                   description: Prime interest rate as a percentage (4-16%)
         *                   example: 7.25
         *                 investmentValue:
         *                   type: number
         *                   description: Initial investment value (10B-100B)
         *                   example: 50000000000
         *       500:
         *         description: Error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while retrieving bank initialization data
         */
        router.get('/bank/initialization', async (req, res) => {
            try {
                const result = this.getBankInitializationUseCase.execute();
                res.json(result);
            } catch (err: any) {
                res.status(500).json({ error: err.message });
            }
        });
      
        /**
         * @openapi
         * /simulation-info:
         *   get:
         *     summary: get information on the simulation
         *     tags:
         *       - Private Endpoints
         *     responses:
         *       200:
         *         description: an object containing simulation information
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 message:
         *                   type: string
         *                   example: Successfully retrieved simulation information
         *                 daysElapsed:
         *                   type: number
         *                   example: 15
         *                 totalTrades:
         *                   type: number
         *                   example: 25
         *                 activities:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       id:
         *                         type: string
         *                         example: "1"
         *                       time:
         *                         type: string
         *                         example: "14:30"
         *                       description:
         *                         type: string
         *                         example: "copper (10 kg) for Đ125.00"
         *                       amount:
         *                         type: number
         *                         example: 125
         *                 machinery:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       purchases:
         *                         type: number
         *                         example: 5
         *                       collections:
         *                         type: number
         *                         example: 3
         *                       measure:
         *                         type: string
         *                         example: "2024-05"
         *                 trucks:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       purchases:
         *                         type: number
         *                         example: 2
         *                       collections:
         *                         type: number
         *                         example: 1
         *                       measure:
         *                         type: string
         *                         example: "2024-05"
         *                 rawMaterials:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       purchases:
         *                         type: number
         *                         example: 8
         *                       collections:
         *                         type: number
         *                         example: 6
         *                       measure:
         *                         type: string
         *                         example: "2024-05"
         *       400:
         *         description: Simulation not running
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Simulation is not running. Please start a simulation first using POST /simulations
         *       500:
         *         description: Error retrieving said information
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while retrieving simulation information
         */
        router.get('/simulation-info', async (req, res) => {
            try {
                if (!this.validateSimulationRunning(res)) return;
                
                res.status(200).json({
                    message: 'Successfully retrieved simulation information',
                    daysElapsed: calculateDaysElapsed(await this.simulationStartDate.read(async (val) => val) ?? new Date(), new Date()),
                    totalTrades: await this.totalTrades.read(async (val) => val),
                    activities: await this.activities.read(async (val) => val),
                    machinery: (await this.machinery.read(async (val) => val)).getOrderedValues(),
                    trucks: (await this.trucks.read(async (val) => val)).getOrderedValues(),
                    rawMaterials: (await this.rawMaterials.read(async (val) => val)).getOrderedValues(),
                    entities: (await this.retrieveAccountUseCase.execute()) ?? [],
                });
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /receive-phone:
         *   post:
         *     summary: Give a person their phone
         *     tags:
         *       - Private Endpoints
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - accountNumber
         *               - phoneName
         *             properties:
         *               accountNumber:
         *                 type: string
         *                 description: The account number of the person to give their phone to
         *                 example: 123456789
         *               phoneName:
         *                 type: string
         *                 description: The name of the phone to give to the person
         *                 example: ePhone
         *               id:
         *                 type: string
         *                 description: The id of the phone to give to the person
         *                 example: 123456
         *               description:
         *                 type: string
         *                 description: The description of the phone to give to the person
         *                 example: A new phone
         *     responses:
         *       201:
         *         description: Phone given
         *       400:
         *         description: Invalid input
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: Invalid input accountNumber and phoneName must be strings
         *       500:
         *         description: Internal server error
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 error:
         *                   type: string
         *                   example: An error occurred while giving phone to person
         */
        router.post('/receive-phone', async (req, res) => {
        const { accountNumber, phoneName, id, description } = req.body;

        if (typeof accountNumber !== 'string' || typeof phoneName !== 'string') {
            return res.status(400).json({ error: 'Invalid input: accountNumber and phoneName must be strings' });
        }

        try {
            await this.receivePhoneUseCase.execute(accountNumber, { 
                id: id ?? Math.floor(Math.random() * 1_000_000),
                name: phoneName,
                description: description ?? 'New phone'
            });
            res.status(201).send(); // <-- was missing
        } catch (err: unknown) {
            res.status(500).json({ error: (err as Error).message });
        }
        });

        app.use('/', router);
    }
}