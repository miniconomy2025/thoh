export interface Money {
    amount: number;
    currency: string; // e.g., 'ZAR'
}

export interface Weight {
    value: number;
    unit: 'kg'; // Standardizing on kilograms
}

export type Month =
  | "January" | "February" | "March" | "April" | "May" | "June"
  | "July" | "August" | "September" | "October" | "November" | "December";

export type Day = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31;

export type WeekDay = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export type Chart = {
  measure: WeekDay,
  collections: number,
  purchases: number
};

export class KeyValueCache<T, V> {
  private map = new Map<T, V>();

  set(key: T, value: V) {
    if (this.map.has(key)) {
        this.map.delete(key);
    }
    this.map.set(key, value);
  }

  get(key: T): V | undefined {
    return this.map.get(key);
  }

  getOrderedValues(): V[] {
    return Array.from(this.map.values());
  }
}

