import 'dotenv/config';
import express from "express";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { StartSimulationUseCase } from "./application/user-cases/start-simulation.use-case";
import { DistributeSalariesUseCase } from "./application/user-cases/distribute-salary-use-case";
import { SimulationController } from "./infrastructure/http/controllers/simulation.controllers";
import { registerRoutes } from "./infrastructure/http/routes";
import { PgMarketRepository } from "./infrastructure/persistence/postgres/market.repository";
import { PgPopulationRepository } from "./infrastructure/persistence/postgres/population.repository";
import { PgSimulationRepository } from "./infrastructure/persistence/postgres/simulation.repository";
import { InMemoryMarketRepository, InMemoryPopulationRepository, InMemorySimulationRepository } from "./infrastructure/persistence/in-memory/in-memory.repositories";
import { ConsoleNotificationService, StubBankService } from "./infrastructure/services/stub-services";
import { GetMarketStateUseCase } from './application/user-cases/get-market-state.use-case';
import { GetPeopleStateUseCase } from './application/user-cases/get-people-state.use-case';
import { GetSimulationDateUseCase } from './application/user-cases/get-simulation-date.use-case';


async function initializeApp() {
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

    const distributeSalariesUseCase = new DistributeSalariesUseCase(
        populationRepo,
        bankService,
        notificationService
    );

    const getMarketStateUseCase = new GetMarketStateUseCase(marketRepo);
    const getPeopleStateUseCase = new GetPeopleStateUseCase(populationRepo);
    const getSimulationDateUseCase = new GetSimulationDateUseCase(simulationRepo);

    // Instantiate the Primary Adapter (the API Controller)
    const simulationController = new SimulationController(
        startSimulationUseCase,
        distributeSalariesUseCase,
        getMarketStateUseCase,
        getPeopleStateUseCase,
        getSimulationDateUseCase,
        simulationRepo,
        marketRepo,
        populationRepo
    );

    // Create and configure the Express application
    const app = express();
    app.use(express.json()); // Middleware to parse JSON bodies

    // Swagger setup
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

    // Setup all routes via registerRoutes
    registerRoutes(app, { simulationController });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`THoH API server is running on http://localhost:${PORT}`);
        console.log('-------------------------------------------------');
        console.log('Persistence:', 'PostgreSQL');
        console.log('Example API calls:');
        console.log(`
        POST http://localhost:3000/simulation/start
        Content-Type: application/json

        {
            "numberOfPeople": 50,
            "initialFunds": { "amount": 1000000, "currency": "ZAR" },
            "baseSalary": { "amount": 5000, "currency": "ZAR" }
        }
        `);
        console.log(`
        POST http://localhost:3000/simulation/salaries/distribute
        `);
        console.log('-------------------------------------------------');
        console.log('Note: Data will be seeded when you start the simulation via API');
    });
}

// Start the application
initializeApp().catch(console.error);
