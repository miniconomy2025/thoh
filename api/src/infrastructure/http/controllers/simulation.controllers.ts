import express, { Request, Response } from 'express';
import { StartSimulationUseCase } from "../../../application/user-cases/start-simulation.use-case";
import { DistributeSalariesUseCase } from '../../../application/user-cases/distribute-salary-use-case';
import { GetMarketStateUseCase } from '../../../application/user-cases/get-market-state.use-case';
import { GetPeopleStateUseCase } from '../../../application/user-cases/get-people-state.use-case';
import { GetSimulationDateUseCase } from '../../../application/user-cases/get-simulation-date.use-case';
import { AdvanceSimulationDayUseCase } from '../../../application/user-cases/advance-simulation-day.use-case';
import { GetMachinesUseCase } from '../../../application/user-cases/get-machines.use-case';
import { GetTrucksUseCase } from '../../../application/user-cases/get-trucks.use-case';
import { GetRawMaterialsUseCase } from '../../../application/user-cases/get-raw-materials.use-case';
import { PurchaseMachineUseCase } from '../../../application/user-cases/purchase-machine.use-case';
import { PurchaseTruckUseCase } from '../../../application/user-cases/purchase-truck.use-case';
import { PurchaseRawMaterialUseCase } from '../../../application/user-cases/purchase-raw-material.use-case';
import { GetOrdersUseCase } from '../../../application/user-cases/get-orders.use-case';
import { PayOrderUseCase } from '../../../application/user-cases/pay-order.use-case';
import { GetCollectionsUseCase } from '../../../application/user-cases/get-collections.use-case';
import { CollectItemUseCase } from '../../../application/user-cases/collect-item.use-case';
import { runDailyTasks, SIM_DAY_INTERVAL_MS } from '../../scheduling/daily-tasks.job';
import { IMarketRepository } from '../../../application/ports/repository.ports';
import { PgCurrencyRepository } from '../../persistence/postgres/currency.repository';
import { StopSimulationUseCase } from '../../../application/user-cases/stop-simulation.use-case';

export class SimulationController {
    private dailyJobInterval: NodeJS.Timeout | null = null;
    private simulationId?: number;
    private advanceSimulationDayUseCase: AdvanceSimulationDayUseCase;

    constructor(
        private readonly startSimulationUseCase: StartSimulationUseCase,
        private readonly stopSimulationUseCase: StopSimulationUseCase,
        private readonly distributeSalariesUseCase: DistributeSalariesUseCase,
        private readonly getMarketStateUseCase: GetMarketStateUseCase,
        private readonly getPeopleStateUseCase: GetPeopleStateUseCase,
        private readonly getSimulationDateUseCase: GetSimulationDateUseCase,
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
        private readonly populationRepo: unknown
    ) {
        this.advanceSimulationDayUseCase = new AdvanceSimulationDayUseCase(this.simulationRepo as any, this.marketRepo);
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
         *     responses:
         *       201:
         *         description: Simulation started successfully
         *       400:
         *         description: Missing required fields
         *       500:
         *         description: Failed to start simulation
         */
        router.post('/simulations', async (req: Request, res: Response) => {
            try {
                const { simulationId } = await this.startSimulationUseCase.execute();
                this.simulationId = simulationId;
                const simulation = await (this.simulationRepo as any).findById(simulationId);
                // Start daily job if not already running
                if (!this.dailyJobInterval) {
                    const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket();
                    const machinesMarket = await this.marketRepo.findMachinesMarket();
                    const trucksMarket = await this.marketRepo.findTrucksMarket();
                    
                    if (simulation && rawMaterialsMarket && machinesMarket && trucksMarket) {
                        const advanceDayUseCase = new AdvanceSimulationDayUseCase(
                            simulation,
                            this.marketRepo
                        );
                        this.dailyJobInterval = setInterval(async () => {
                            if (this.simulationId) {
                                try {
                                    await this.advanceSimulationDayUseCase.execute(this.simulationId);
                                } catch (err: unknown) {
                                    console.error('Failed to advance simulation day:', err);
                                }
                            }
                        }, SIM_DAY_INTERVAL_MS);
                    }
                }

                res.status(201).json({ message: `Simulation started successfully and daily job started. Generated simulationId: ${simulation.id}` });
            } catch (error: unknown) {
                console.error(error);
                res.status(500).json({ error: 'Failed to start simulation.', details: (error as Error).message });
            }
        });

        /**
         * @openapi
         * /people:
         *   get:
         *     summary: Get people and their salaries
         *     responses:
         *       200:
         *         description: People state
         *       500:
         *         description: Error
         */
        router.get('/people', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const state = await this.getPeopleStateUseCase.execute();
                res.json(state);
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });

        /**
         * @openapi
         * /time:
         *   get:
         *     summary: Get the Unix epoch timestamp when the simulation started
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
         *       500:
         *         description: Error
         */
        router.get('/time', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const simulation = await (this.simulationRepo as any).findById(this.simulationId!);
                if (!simulation) {
                    throw new Error('Simulation not found');
                }
                res.json({ unixEpochStartTime: simulation.getUnixEpochStartTime() });
            } catch (err: unknown) {
                res.status(500).json({ error: (err as Error).message });
            }
        });
        
        
        /**
         * @openapi
         * /current-simulation-time:
         *   get:
         *     summary: Get the current in-simulation date and time
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
         *       500:
         *         description: Error
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
         *                         example: "electronics_machine"
         *                         description: Machine type name
         *                       quantity:
         *                         type: integer
         *                         description: Total quantity for this machine type
         *                       materialRatio:
         *                         type: string
         *                         example: "1:2:5"
         *                         description: Material ratio for this machine type
         *                       productionRate:
         *                         type: integer
         *                         example: 500
         *                         description: Average production rate for this machine type
         *       404:
         *         description: Machines not found
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
         *                     example: "large_truck"
         *                     description: Truck type name
         *                   price:
         *                     type: number
         *                     description: Average price for this truck type
         *                   quantity:
         *                     type: integer
         *                     description: Total quantity for this truck type
         *                   operatingCost:
         *                     type: number
         *                     description: Average operating cost for this truck type
         *                   maximumLoad:
         *                     type: number
         *                     description: Average maximum load for this truck type
         *       404:
         *         description: trucks market not found
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
         *                     example: "copper"
         *                     description: Raw material type name
         *                   pricePerKg:
         *                     type: number
         *                     description: Average price per kg for this material type
         *                   quantityAvailable:
         *                     type: integer
         *                     description: Total quantity available for this material type
         *       404:
         *         description: Raw materials market not found
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
         *                     description: Unique order identifier
         *                   itemName:
         *                     type: string
         *                     description: Name of the purchased item
         *                   quantity:
         *                     type: number
         *                     description: Quantity purchased
         *                   unitPrice:
         *                     type: number
         *                     description: Price per unit
         *                   totalPrice:
         *                     type: number
         *                     description: Total price of the order
         *                   currency:
         *                     type: string
         *                     description: Currency code
         *                   orderDate:
         *                     type: string
         *                     format: date-time
         *                     description: When the order was placed
         *                   status:
         *                     type: string
         *                     enum: [pending, completed, cancelled]
         *                     description: Order status
         *       500:
         *         description: Error retrieving orders
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
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               machineName:
         *                 type: string
         *               quantity:
         *                 type: integer
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
         *                 machineName:
         *                   type: string
         *                 quantity:
         *                   type: integer
         *                 price:
         *                   type: number
         *                 weight:
         *                   type: number
         *                 machineDetails:
         *                   type: object
         *                   properties:
         *                     requiredMaterials:
         *                       type: string
         *                     materialRatio:
         *                       type: string
         *                       example: "1:2:5"
         *                     productionRate:
         *                       type: integer
         *                       example: 100
         *       400:
         *         description: Invalid request
         *       500:
         *         description: Error
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
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               truckName:
         *                 type: string
         *               quantity:
         *                 type: integer
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
         *                 truckName:
         *                   type: string
         *                 price:
         *                   type: number
         *                 maximumLoad:
         *                   type: integer
         *                 operatingCostPerDay:
         *                   type: string
         *                   example: D5000/day
         *       400:
         *         description: Error
         *       404:
         *         description: Market not found
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
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               materialName:
         *                 type: string
         *               weightQuantity:
         *                 type: number
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
         *                 materialName:
         *                   type: string
         *                 weightQuantity:
         *                   type: number
         *                 price:
         *                   type: number
         *                 bankAccount:
         *                   type: string
         *       400:
         *         description: Error, insufficient inventory, or simulation not running
         *       404:
         *         description: Raw materials market not found
         */
        router.post('/raw-materials', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const { materialName, weightQuantity } = req.body;
                
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
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               orderId:
         *                 type: integer
         *                 description: ID of the order to pay for
         *     responses:
         *       200:
         *         description: Order paid and fulfilled successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 orderId:
         *                   type: integer
         *                   description: ID of the paid order
         *                 itemName:
         *                   type: string
         *                   description: Name of the purchased item
         *                 quantity:
         *                   type: number
         *                   description: Quantity purchased
         *                 totalPrice:
         *                   type: number
         *                   description: Total price paid
         *                 status:
         *                   type: string
         *                   enum: [completed]
         *                   description: Updated order status
         *                 message:
         *                   type: string
         *                   description: Success message
         *       400:
         *         description: Invalid request or order already completed/cancelled
         *       404:
         *         description: Order not found
         *       500:
         *         description: Error processing payment
         */
        router.post('/orders/pay', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const { orderId } = req.body;
                
                if (!orderId || typeof orderId !== 'number') {
                    return res.status(400).json({ error: 'orderId is required and must be a number' });
                }
                
                const result = await this.payOrderUseCase.execute({ orderId });
                
                // If order cannot be fulfilled, return 200 with canFulfill: false
                // If order can be fulfilled, return 200 with canFulfill: true
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
         *                   id:
         *                     type: integer
         *                     description: Collection ID
         *                   orderId:
         *                     type: integer
         *                     description: Associated order ID
         *                   itemName:
         *                     type: string
         *                     description: Name of the item
         *                   quantity:
         *                     type: number
         *                     description: Quantity to collect
         *                   orderDate:
         *                     type: string
         *                     format: date-time
         *                     description: When the order was placed
         *                   collected:
         *                     type: boolean
         *                     description: Whether the item has been collected
         *                   collectionDate:
         *                     type: string
         *                     format: date-time
         *                     description: When the item was collected (if collected)
         *       400:
         *         description: Simulation not running
         *       500:
         *         description: Error retrieving collections
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
         * /collections:
         *   patch:
         *     summary: Mark an item as collected (partial or full)
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               orderId:
         *                 type: integer
         *                 description: ID of the order to mark as collected
         *               collectQuantity:
         *                 type: number
         *                 description: Quantity to collect (optional, defaults to all remaining)
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
         *                   description: ID of the collected order
         *                 quantityRemaining:
         *                   type: number
         *                   description: Quantity remaining to collect
         *       400:
         *         description: Invalid request, item already collected, or simulation not running
         *       404:
         *         description: Collection not found
         *       500:
         *         description: Error processing collection
         */
        router.patch('/collections', async (req, res) => {
            if (!this.validateSimulationRunning(res)) return;
            
            try {
                const { orderId, collectQuantity } = req.body;
                
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

        /**
         * @openapi
         * /simulation/stop:
         *   post:
         *     summary: Stop the current simulation
         *     responses:
         *       200:
         *         description: Simulation stopped successfully
         *       400:
         *         description: No simulation running
         *       500:
         *         description: Error stopping simulation
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

        app.use('/', router);
    }
}
