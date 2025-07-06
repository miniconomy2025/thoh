
export type RawMaterialType = 'copper' | 'silicon' | 'sand' | 'plastic' | 'aluminium';
export type MachineType = 
  // Electronic machines
  | 'electronics_machine'
  
  // Phone-specific machines
  | 'ephone_machine'
  | 'ephone_plus_machine'
  | 'ephone_pro_max_machine'
  | 'cosmos_z25_machine'
  | 'cosmos_z25_ultra_machine'
  | 'cosmos_z25_fe_machine'
  
  // Component machines
  | 'case_machine'
  | 'screen_machine'
  
  // Recycling
  | 'recycling_machine';
export type TruckType = 'large_truck' | 'medium_truck' | 'small_truck';