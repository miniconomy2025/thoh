export interface Money {
    amount: number;
    currency: string; // e.g., 'ZAR'
}

export interface Weight {
    value: number;
    unit: 'kg'; // Standardizing on kilograms
}
