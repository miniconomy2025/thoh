import { Application } from 'express';
import { SimulationController } from './controllers/simulation.controllers';

export function registerRoutes(app: Application, controllers: { simulationController: SimulationController }) {
    controllers.simulationController.setupRoutes(app);
}
