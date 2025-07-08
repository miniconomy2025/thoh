import { PhoneModel } from '../population/population.types';

export function getMarketConfig() {
  return {
    rawMaterials: [
      { name: 'copper', costPerKg: 20, initialWeight: 10000 },
      { name: 'silicon', costPerKg: 15, initialWeight: 10000 },
      { name: 'sand', costPerKg: 5, initialWeight: 50000 },
      { name: 'plastic', costPerKg: 8, initialWeight: 20000 },
      { name: 'aluminium', costPerKg: 30, initialWeight: 15000 },
    ],
    machines: [
      // Electronic machines
      {
        type: 'electronics_machine',
        name: 'Electronics Machine',
        materialRatio: '4:3', // copper : silicon
        productionRate: 100,
         materialRatioDescription: 'copper : silicon',
        baseCost: 12000,
        baseWeight: 600
      },
      
      // Phone-specific machines
      {
        type: 'ephone_machine',
        name: 'EPhone Assembly Machine',
        materialRatio: '1:1:5',
        materialRatioDescription: 'cases : screens : electronics',
        productionRate: 50,
        baseCost: 15000,
        baseWeight: 500
      },
      {
        type: 'ephone_plus_machine',
        name: 'ePhone Plus Assembly Machine',
        materialRatio: '1:2:7',
        materialRatioDescription: 'cases : screens : electronics',
        productionRate: 40,
        baseCost: 18000,
        baseWeight: 550
      },
      {
        type: 'ephone_pro_max_machine',
        name: 'ePhone Pro Max Assembly Machine',
        materialRatio: '1:2:10',
        materialRatioDescription: 'cases : screens : electronics',
        productionRate: 30,
        baseCost: 22000,
        baseWeight: 600
      },
      {
        type: 'cosmos_z25_machine',
        name: 'Cosmos Z25 Assembly Machine',
        materialRatio: '1:2:5',
        materialRatioDescription: 'cases : screens : electronics',
        productionRate: 45,
        baseCost: 16000,
        baseWeight: 520
      },
      {
        type: 'cosmos_z25_ultra_machine',
        name: 'Cosmos Z25 Ultra Assembly Machine',
        materialRatio: '1:3:11',
        materialRatioDescription: 'cases : screens : electronics',
        productionRate: 25,
        baseCost: 25000,
        baseWeight: 650
      },
      {
        type: 'cosmos_z25_fe_machine',
        name: 'Cosmos Z25 FE Assembly Machine',
        materialRatio: '1:2:8',
        materialRatioDescription: 'cases : screens : electronics',
        productionRate: 35,
        baseCost: 19000,
        baseWeight: 580
      },
      
      // Component machines
      {
        type: 'case_machine',
        name: 'Case Manufacturing Machine',
        materialRatio: '4:7', // plastic : aluminium
        productionRate: 80,
        materialRatioDescription: 'plastic : aluminium',
        baseCost: 10000,
        baseWeight: 450
      },
      {
        type: 'screen_machine',
        name: 'Screen Manufacturing Machine',
        materialRatio: '2:7', // copper : sand
        productionRate: 70,
        materialRatioDescription: 'copper : sand',
        baseCost: 11000,
        baseWeight: 480
      },
      
      // Recycling
      {
        type: 'recycling_machine',
        name: 'Phone Recycling Machine',
        materialRatio: 'any_phone', // can recycle any phone
        productionRate: 20,
        baseCost: 8000,
        baseWeight: 400
      }
    ],
    // Add more config as needed
  };
}

export function getPhoneModels(): PhoneModel[] {
  return [
    'ePhone',
    'ePhone_plus',
    'ePhone_pro_max',
    'Cosmos_Z25',
    'Cosmos_Z25_ultra',
    'Cosmos_Z25_FE',
  ];
} 