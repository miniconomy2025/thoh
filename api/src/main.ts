import 'dotenv/config';
import express from "express";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { StartSimulationUseCase } from "./application/user-cases/start-simulation.use-case";
import { DistributeSalariesUseCase } from "./application/user-cases/distribute-salary-use-case";
import { SimulationController } from "./infrastructure/http/controllers/simulation.controllers";
import { registerRoutes } from "./infrastructure/http/routes";
import { PgMarketRepository } from "./infrastructure/persistence/postgres/market.repository";
import { PgPopulationRepository } from "./infrastructure/persistence/postgres/population.repository";
import { PgSimulationRepository } from "./infrastructure/persistence/postgres/simulation.repository";

import { ConsoleNotificationService, StubBankService } from "./infrastructure/services/stub-services";
import { GetMarketStateUseCase } from './application/user-cases/get-market-state.use-case';
import { GetPeopleStateUseCase } from './application/user-cases/get-people-state.use-case';
import { GetSimulationDateUseCase } from './application/user-cases/get-simulation-date.use-case';
import { GetMachinesUseCase } from './application/user-cases/get-machines.use-case';
import { GetTrucksUseCase } from './application/user-cases/get-trucks.use-case';
import { GetRawMaterialsUseCase } from './application/user-cases/get-raw-materials.use-case';
import { PurchaseMachineUseCase } from './application/user-cases/purchase-machine.use-case';
import { PurchaseTruckUseCase } from './application/user-cases/purchase-truck.use-case';
import { PurchaseRawMaterialUseCase } from './application/user-cases/purchase-raw-material.use-case';
import { GetOrdersUseCase } from './application/user-cases/get-orders.use-case';
import { PayOrderUseCase } from './application/user-cases/pay-order.use-case';
import { GetCollectionsUseCase } from './application/user-cases/get-collections.use-case';
import { CollectItemUseCase } from './application/user-cases/collect-item.use-case';
import { StopSimulationUseCase } from './application/user-cases/stop-simulation.use-case';
import { AppDataSource as PopulationDataSource } from './domain/population/data-source';
import { AppDataSource as MarketDataSource } from './domain/market/data-source';
import { BreakPhonesUseCase } from './application/user-cases/break-phones.use-case';
import dotenv from 'dotenv';

dotenv.config();

async function initializeApp() {
    try {
        await PopulationDataSource.initialize();
        await MarketDataSource.initialize();
    } catch (err) {
        process.exit(1);
    }

    const simulationRepo = new PgSimulationRepository();
    const marketRepo = new PgMarketRepository();
    const populationRepo = new PgPopulationRepository();
    const bankService = new StubBankService();
    const notificationService = new ConsoleNotificationService();

    const startSimulationUseCase = new StartSimulationUseCase(
        simulationRepo,
        marketRepo,
        populationRepo,
        bankService
    );

    const stopSimulationUseCase = new StopSimulationUseCase(simulationRepo);

    const distributeSalariesUseCase = new DistributeSalariesUseCase(
        populationRepo,
        bankService,
        notificationService
    );

    const getMarketStateUseCase = new GetMarketStateUseCase(marketRepo);
    const getPeopleStateUseCase = new GetPeopleStateUseCase(populationRepo);
    const getSimulationDateUseCase = new GetSimulationDateUseCase(simulationRepo);
    
    // Market-related use cases
    const getMachinesUseCase = new GetMachinesUseCase(marketRepo);
    const getTrucksUseCase = new GetTrucksUseCase(marketRepo);
    const getRawMaterialsUseCase = new GetRawMaterialsUseCase(marketRepo);
    const purchaseMachineUseCase = new PurchaseMachineUseCase(marketRepo);
    const purchaseTruckUseCase = new PurchaseTruckUseCase(marketRepo);
    const purchaseRawMaterialUseCase = new PurchaseRawMaterialUseCase(marketRepo);
    const getOrdersUseCase = new GetOrdersUseCase(marketRepo);
    const payOrderUseCase = new PayOrderUseCase(marketRepo);
    const getCollectionsUseCase = new GetCollectionsUseCase(marketRepo);
    const collectItemUseCase = new CollectItemUseCase(marketRepo);
    const breakPhonesUseCase = new BreakPhonesUseCase(populationRepo);

    // Instantiate the Primary Adapter (the API Controller)
    const simulationController = new SimulationController(
        startSimulationUseCase,
        stopSimulationUseCase,
        distributeSalariesUseCase,
        getMarketStateUseCase,
        getPeopleStateUseCase,
        getSimulationDateUseCase,
        getMachinesUseCase,
        getTrucksUseCase,
        getRawMaterialsUseCase,
        purchaseMachineUseCase,
        purchaseTruckUseCase,
        purchaseRawMaterialUseCase,
        getOrdersUseCase,
        payOrderUseCase,
        getCollectionsUseCase,
        collectItemUseCase,
        simulationRepo,
        marketRepo,
        populationRepo,
        breakPhonesUseCase
    );

    const app = express();
    app.use(cors());
    app.use(express.json());

    const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'THoH Simulation API',
                version: '1.0.0',
                description: 'API documentation for the THoH simulation backend',
            },
        },
        apis: ['./src/infrastructure/http/controllers/*.ts', './src/infrastructure/http/routes.ts'],
    };
    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    // Setup all routes via registerRoutes
    registerRoutes(app, { simulationController });

    const PORT = 3000;
    app.listen(PORT, () => {
    console.log('API Documentation: http://localhost:3000/api-docs');
    });
}

// Start the application
initializeApp().catch(console.error);
