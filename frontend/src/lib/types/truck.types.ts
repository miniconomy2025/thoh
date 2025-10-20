export type Truck = {
  truckName: string;
  description: string;
  price: number;
  quantity: number;
  operatingCost: number;
  maximumLoad: number;
}

export const isTruck = (obj: any): obj is Truck => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'truckName' in obj && typeof obj.truckName === 'string' &&
    'description' in obj && typeof obj.description === 'string' &&
    'price' in obj && typeof obj.price === 'number' &&
    'quantity' in obj && typeof obj.quantity === 'number' &&
    'operatingCost' in obj && typeof obj.operatingCost === 'number' &&
    'maximumLoad' in obj && typeof obj.maximumLoad === 'number'
  );
}