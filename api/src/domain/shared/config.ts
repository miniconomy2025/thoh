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