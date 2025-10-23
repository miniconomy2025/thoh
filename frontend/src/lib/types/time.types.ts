export type SimulationTimeResponse = { 
  simulationDate: string
  simulationTime: string
  simulationDay: number
}

export type EpochTimeResponse = { 
  unixEpochStartTime: number
}

export type SimulationTime = { 
  simulationDateTime: Date
  simulationDay: number
}