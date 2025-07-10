export type RawMaterial = {
  rawMaterialName: string;
  description: string;
  pricePerKg: number;
  quantityAvailable: number;
}

export const isRawMaterial = (obj: any): obj is RawMaterial => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'rawMaterialName' in obj && typeof obj.rawMaterialName === 'string' &&
    'description' in obj && typeof obj.description === 'string' &&
    'pricePerKg' in obj && typeof obj.pricePerKg === 'number' &&
    'quantityAvailable' in obj && typeof obj.quantityAvailable === 'number'
  );
}