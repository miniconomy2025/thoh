import swaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJSDoc.Options= {
  definition: {
      openapi: '3.0.0',
      info: {
          title: 'THoH Simulation API',
          version: '1.0.0',
          description: 'API documentation for the THoH simulation backend',
      },
      servers: [
        {
          url: '	https://thoh-api.projects.bbdgrad.com',
          description: 'Production Server',
        },
        {
          url: 'http://localhost:3000',
          description: 'Local Development Server',
        },
      ],
  },
  apis: ['./src/infrastructure/http/controllers/*.ts', './src/infrastructure/http/routes.ts'],
};