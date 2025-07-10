import { useEffect, useState } from "react"
import { ModeToggle } from "../components/mode-toggle"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  SidebarTrigger,
} from "../components/ui/sidebar"
import { CONSTANTS } from "../lib/constants"
import { useInterval } from "../lib/hooks"
import type { StartSimulationResponse } from "../lib/types/simulation.types"
import { isApiError, manageLoading } from "../lib/utils"
import simulationService from "../services/simulation.service"

type AdminControlPanelLoadingState = {
  getSimulation: boolean;
  startSimulation: boolean;
  stopSimulation: boolean;
  systemStatus: boolean;
}

type AdminControlPanelErrorState = {
  getSimulation: string | undefined;
  startSimulation: string | undefined;
  stopSimulation: string | undefined;
  systemStatus: string | undefined;
  syncedSimulationTime: string | undefined;
}


export function AdminControlPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [simulation, setSimulation] = useState<StartSimulationResponse | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loadingState, setLoadingState] = useState<AdminControlPanelLoadingState>({
    startSimulation: false,
    stopSimulation: false,
    systemStatus: false,
    getSimulation: false,
  })
  const [errorState, setErrorState] = useState<AdminControlPanelErrorState>({
    startSimulation: undefined,
    stopSimulation: undefined,
    systemStatus: undefined,
    syncedSimulationTime: undefined,
    getSimulation: undefined
  })

  useInterval(() => {
    if (!isRunning || !simulation) {
      // do nothing
    }else {
      setCurrentDate(() => new Date(currentDate.getTime() + CONSTANTS.SIMULATION_SECOND_IN_MS / 10));
    }
  }, 100)

  useInterval(() => {
    if (!isRunning || !simulation) {
      // do nothing
    } else {
      handleSyncedSimulationTime(simulation);
    }
  }, CONSTANTS.SIMULATION_SYNC_INTERVAL);

  const handleStartSimulation = () => {
    manageLoading<AdminControlPanelLoadingState>(
      ['startSimulation', 'systemStatus'], 
      setLoadingState,
      async () => {
        try {
          const simulationResponse = await simulationService.startSimulation()
          if (isApiError(simulationResponse)) {
            setIsRunning(false);
            setSimulation(null);
          } else {
            setIsRunning(true);
            setSimulation(simulationResponse);
            handleSyncedSimulationTime(simulationResponse);
          }
        } catch(error) {
          setIsRunning(false);
          setErrorState((prev) => ({ ...prev, startSimulation: (error as Error).message }));
        };
      }
    );
  }

  const handleResetSimulation = () => {
    manageLoading<AdminControlPanelLoadingState>(
      ['stopSimulation', 'systemStatus'], 
      setLoadingState,
      async () => {
        try {
          const stopSimulationResponse = await simulationService.stopSimulation();
          if (isApiError(stopSimulationResponse)) {
            setErrorState((prev) => ({ ...prev, stopSimulation: stopSimulationResponse.error }));
          } else {
            setIsRunning(false)
            setSimulation(null)
          }
        } catch (error) {
          setErrorState((prev) => ({ ...prev, stopSimulation: (error as Error).message }));
        }
      }
    );
  }

  const handleSyncedSimulationTime = (simulation: StartSimulationResponse) => {
    if (simulation) {
      simulationService.getCurrentSimulationTime().then((simulationTime) => {
        if (isApiError(simulationTime)) {
          setCurrentDate(() => currentDate);
        } else {
          setCurrentDate(simulationTime.simulationDateTime);
        }
      }).catch((error) => {
        setErrorState((prev) => ({ ...prev, syncedSimulationTime: (error as Error).message }));
      });
    } else {
      setCurrentDate(() => currentDate);
    }
  }

  const formatDate = (date: Date) => {
    return date
      .toString()
      .replace(/GMT.*$/, "")
      .trim()
  }

  useEffect(() => {
    manageLoading<AdminControlPanelLoadingState>(
      ['getSimulation', 'systemStatus'], 
      setLoadingState,
      async () => {
        const existingSimulation = await simulationService.getSimulation();

        if (isApiError(existingSimulation)) {
          setErrorState((prev) => ({ ...prev, getSimulation: existingSimulation.error }));
          setIsRunning(false);
          setSimulation(null);
          return;
        } else {
          setErrorState((prev) => ({ ...prev, getSimulation: undefined }));
          setSimulation(existingSimulation);
          setIsRunning(true);
          handleSyncedSimulationTime(existingSimulation);
        }
      }
    );
  }, [])

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border mx-2" />
          <h1 className="text-lg font-semibold grow">Admin Control Panel</h1>
          <ModeToggle />
      </header>
      <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
          <Card>
              <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Admin Control Panel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              {/* Control Buttons */}
              <div className="flex justify-center gap-4">
                  <Button onClick={handleStartSimulation} disabled={isRunning || loadingState.startSimulation} className="px-6 py-2">
                  Start Simulation {loadingState.startSimulation ? "..." : ""}
                  </Button>
                  <Button onClick={handleResetSimulation} disabled={!isRunning || loadingState.stopSimulation} variant="outline" className="px-6 py-2 bg-transparent">
                  Reset Simulation {loadingState.stopSimulation ? "..." : ""}
                  </Button>
              </div>

              {/* System Status */}
              <Card>
                  <CardHeader>
                  <CardTitle className="text-lg text-center">System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {errorState.systemStatus && <p className="text-red-600">{errorState.systemStatus}</p>}
                    {loadingState.systemStatus && <p className="text-gray-600">Starting Simulation...</p>}
                    {!loadingState.systemStatus && !errorState.systemStatus && <>
                      <div className="flex justify-between items-center">
                          <span className="font-medium">Simulation Date:</span>
                          <span className="text-sm font-mono">{formatDate(currentDate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="font-medium">System Status:</span>
                          <span className={`font-medium ${isRunning ? "text-green-600" : "text-orange-600"}`}>
                          {isRunning ? "Running" : "Has not started"}
                          </span>
                      </div>
                    </>}
                  </CardContent>
              </Card>
              </CardContent>
          </Card>
          </div>
      </div>
    </>
  )
}
