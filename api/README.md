# THoH Simulation API

A simulation API for managing markets, machines, vehicles, and raw materials with PostgreSQL persistence.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # PostgreSQL Configuration
   POSTGRES_USER=postgres
   POSTGRES_HOST=localhost
   POSTGRES_DB=thoh
   POSTGRES_PASSWORD=your_password_here
   POSTGRES_PORT=5432

   # Application Configuration
   NODE_ENV=development
   PORT=3000
   ```

4. **Set up the database**
   ```bash
   # Run migrations to create tables
   npm run migration:run
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:
`http://localhost:3000/api-docs`

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run migration:generate` - Generate new migration files
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- `npm run seed` - Seed the database with initial data

## 🏗️ Project Structure

```
src/
├── application/           # Application layer (use cases)
│   ├── ports/            # Interface definitions
│   └── user-cases/       # Business logic
├── domain/               # Domain layer (entities, aggregates)
│   ├── market/           # Market domain
│   ├── population/       # Population domain
│   ├── simulation/       # Simulation domain
│   └── shared/           # Shared domain objects
├── infrastructure/       # Infrastructure layer
│   ├── http/             # HTTP controllers and routes
│   ├── persistence/      # Database repositories
│   │   ├── postgres/     # PostgreSQL implementation
│   │   └── in-memory/    # In-memory implementation
│   └── services/         # External services
└── main.ts              # Application entry point
```

## 🎯 Core Features

### Simulation Management
- Start new simulations
- Advance simulation days
- Get simulation status and date

### Market Operations
- **Machines**: Buy/sell machines with production ratios
- **Vehicles**: Buy/sell vehicles with operating costs
- **Raw Materials**: Purchase raw materials by weight

### Population Management
- Create populations with people
- Distribute salaries
- Manage phone ownership and status

## 📡 API Endpoints

### Simulation
- `POST /simulation/start` - Start a new simulation
- `GET /simulation/date` - Get current simulation date
- `POST /simulation/advance-day` - Advance simulation by one day

### Market - Machines
- `GET /simulation/market/machines?marketId=1` - Get available machines
- `POST /simulation/market/buy-machine` - Buy a machine

### Market - Vehicles
- `GET /simulation/market/vehicles?marketId=1` - Get available vehicles
- `POST /simulation/market/buy-vehicle` - Buy a vehicle

### Market - Raw Materials
- `GET /simulation/market/raw-materials?marketId=1` - Get raw materials
- `POST /simulation/market/buy-raw-material` - Buy raw materials

### Currencies
- `GET /simulation/currencies` - Get all available currencies
- `GET /simulation/currencies/default` - Get default currency

## 💡 Example Usage

### Start a Simulation
```bash
curl -X POST http://localhost:3000/simulation/start \
  -H "Content-Type: application/json" \
  -d '{
    "numberOfPeople": 50,
    "initialFunds": 1000000,
    "baseSalary": 5000
  }'
```

### Buy a Machine
```bash
curl -X POST http://localhost:3000/simulation/market/buy-machine \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": 1,
    "machineId": 1
  }'
```

### Get Available Machines
```bash
curl http://localhost:3000/simulation/market/machines?marketId=1
```

## 🔄 Database Schema

The application uses PostgreSQL with the following main tables:
- `simulation` - Simulation state and progress
- `market` - Market instances
- `machine` - Available machines with production ratios
- `vehicle` - Available vehicles with operating costs
- `raw_material` - Raw materials with pricing
- `currency` - Supported currencies
- `person` - Population members
- `phone` - Phone inventory

## 🛠️ Development

### Architecture
This API follows Clean Architecture principles with:
- **Domain Layer**: Business entities and rules
- **Application Layer**: Use cases and business logic
- **Infrastructure Layer**: External concerns (database, HTTP)

### Adding New Features
1. Define domain entities in `src/domain/`
2. Create use cases in `src/application/user-cases/`
3. Implement repositories in `src/infrastructure/persistence/`
4. Add controllers in `src/infrastructure/http/controllers/`

### Database Migrations
```bash
# Generate new migration
npm run migration:generate

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check your `.env` file configuration
   - Verify database exists: `createdb thoh`

2. **Migration Errors**
   - Run `npm run migration:run` to apply pending migrations
   - Check migration files in `src/infrastructure/persistence/postgres/migrations/`

3. **Port Already in Use**
   - Change the PORT in your `.env` file
   - Or kill the process using the port

### Logs
The application logs database operations and API requests. Check the console output for debugging information.

## 📄 License

This project is licensed under the ISC License. 