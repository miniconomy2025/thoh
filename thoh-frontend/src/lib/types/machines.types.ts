const machineInputs = ['copper', 'silicon', 'sand', 'plastic', 'aluminium', 'cases', 'screens', 'electronics'] as const;
export type MachineInput = typeof machineInputs[number];

export type Machine = {
    machineName: "electronics_machine",
    inputs: string,
    quantity: number,
    inputRatio: {
      [key in MachineInput]: number
    },
    productionRate: number,
    price: number
}

export const isMachine = (obj: any): obj is Machine => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'machineName' in obj &&
    typeof obj.machineName === 'string' &&
    'inputs' in obj &&
    typeof obj.inputs === 'string' &&
    'quantity' in obj &&
    typeof obj.quantity === 'number' &&
    'inputRatio' in obj &&
    typeof obj.inputRatio === 'object' &&
    Object.keys(obj.inputRatio).every(key => 
      machineInputs.includes(key as MachineInput) && 
      typeof obj.inputRatio[key] === 'number'
    ) &&
    'productionRate' in obj &&
    typeof obj.productionRate === 'number' &&
    'price' in obj &&
    typeof obj.price === 'number'
  );
}