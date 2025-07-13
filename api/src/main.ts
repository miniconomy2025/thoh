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
import { BreakPhonesUseCase } from './application/user-cases/break-phones.use-case';
import dotenv from 'dotenv';
import { ReceivePhoneUseCase } from './application/user-cases/recieve-phone-use-case';
import { BuyPhoneUseCase } from './application/user-cases/buy-phone-use-case';
import { AppDataSource } from './domain/shared/data-source';
import { swaggerOptions } from './swagger-options';

dotenv.config();

async function initializeApp() {
    try {
       await AppDataSource.initialize();
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
    const receivePhoneUseCase = new ReceivePhoneUseCase();
    const buyPhoneUseCase = new BuyPhoneUseCase();

    const simulationController = new SimulationController(
        startSimulationUseCase,
        stopSimulationUseCase,
        getPeopleStateUseCase,
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
        breakPhonesUseCase,
        receivePhoneUseCase,
        buyPhoneUseCase
    );

    const app = express();
    app.use(cors({
        origin: 'http://ec2-13-247-96-130.af-south-1.compute.amazonaws.com:4173',
        credentials: true
    }));
    app.use(express.json());

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    registerRoutes(app, { simulationController });

    const PORT = 3000;
    app.listen(PORT, () => {
    console.log('API Documentation: http://localhost:3000/api-docs');
    });
}

initializeApp().catch(console.error);
