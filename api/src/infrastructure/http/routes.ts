import { Application } from 'express';
import { SimulationController } from './controllers/simulation.controllers';

// Placeholder for HTTP routes
export function registerRoutes(app: Application, controllers: { simulationController: SimulationController }) {
    controllers.simulationController.setupRoutes(app);
    // Add more controllers here as needed
}
