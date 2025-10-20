

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { ScrollArea } from "../components/ui/scroll-area"
import { Badge } from "../components/ui/badge"
import { TrendingUp, Activity, Clock } from "lucide-react"
import { SidebarTrigger } from "../components/ui/sidebar"
import { ModeToggle } from "../components/mode-toggle"
import { ChartAreaStacked } from "../components/ui/char-area-stacked"
import simulationService from "../services/simulation.service"
import { isApiError } from "../lib/utils"
import type { Chart } from "../lib/types/shared.types"

interface Entity {
  id: string
  type: string
  name: string
  accountValue: string
}

interface ActivityItem {
  id: string
  time: string
  description: string
  amount?: number
}

export function EconomicFlowReporting() {
  const [currentDay, setCurrentDay] = useState(0)
  // const [totalEconomyValue, setTotalEconomyValue] = useState(2450000)
  const [totalTrades, setTotalTrades] = useState(0)
  const [machineryChartData, setMachineryChartData] = useState<Chart[]>([])
  const [truckChartData, setTruckChartData] = useState<Chart[]>([])
  const [rawMaterialsData, setRawMaterialsData] = useState<Chart[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [entities, setEntities] = useState<Entity[]>([]);


  function getEntityName(type: string): string | undefined {
    return [
      "Global Materials Ltd",
      "FastTrans Corp",
      "RetailBank1",
      "CommercialBank Pro",
      "TechPhone Inc",
      "EcoRecycle Solutions"
    ].find((name) => name.toLowerCase().includes(type.toLowerCase()));
  }

  useEffect(() => {
  let cancelled = false;
  let timeoutId: NodeJS.Timeout;

  const poll = async () => {
    const existingSimulation = await simulationService.getSimulation();
    if (isApiError(existingSimulation)) {
      console.error(existingSimulation.error);
      return;
    }

    const tick = async () => {
      const simulationInfo = await simulationService.simulationInfo();
      if (isApiError(simulationInfo)) {
        console.error(simulationInfo.error);
        return;
      }

      if (cancelled) return;

      setCurrentDay(simulationInfo.daysElapsed);
      setActivities(simulationInfo.activities);
      setTotalTrades(simulationInfo.totalTrades);
      setMachineryChartData(simulationInfo.machinery);
      setTruckChartData(simulationInfo.trucks);
      setRawMaterialsData(simulationInfo.rawMaterials);
      setEntities(simulationInfo.entities.map((entity) => ({
        id: entity.id.toString(),
        type: entity.name,
        name: entity.name,
        accountValue: entity.balance,
      })));

      // schedule next tick
      timeoutId = setTimeout(tick, 5000); // every 5 seconds, 1 hour passes in simulation
    };

    tick();
  };

  poll();

  return () => {
    cancelled = true;
    clearTimeout(timeoutId);
  };
}, []);


  const getEntityTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "Supplier": "bg-blue-100 text-blue-800",
      "Logistics": "bg-green-100 text-green-800",
      "Retail Bank": "bg-purple-100 text-purple-800",
      "Commercial Bank": "bg-indigo-100 text-indigo-800",
      "Phone Companies": "bg-orange-100 text-orange-800",
      "Recycler": "bg-emerald-100 text-emerald-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  function formatCurrency(amount: number) {
    return `Đ ${amount.toLocaleString()}`
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border mx-2" />
          <h1 className="text-lg font-semibold grow">Economic Flow Reporting</h1>
          <ModeToggle />
      </header>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Economic Flow Reporting</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Economy Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">∞</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrades.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Simulation Day</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentDay}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Entity Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Entity Table</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Entity Name</TableHead>
                      <TableHead className="text-right">Account Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entities.map((entity) => (
                      <TableRow key={entity.id}>
                        <TableCell>
                          <Badge className={getEntityTypeColor(entity.type)}>{entity.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{getEntityName(entity.type) ?? "Unknown"}</TableCell>
                        <TableCell className="text-right font-mono">Đ {entity.accountValue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-muted-foreground">{activity.time}</span>
                          </div>
                          <p className="text-sm mt-1">{activity.description}</p>
                          {activity.amount && (
                            <p className="text-sm font-semibold text-green-600 mt-1">{formatCurrency(activity.amount)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trend Widgets */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Trend Widgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Machinery sold per year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                  <ChartAreaStacked chartData={machineryChartData} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Trucks sold per year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                  <ChartAreaStacked chartData={truckChartData} 
                    fillColourA="lightgreen"
                    strokeColourA="green"
                    fillColourB="darkgreen"
                    strokeColourB="darkgreen"
                    />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Raw Material Sold per Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                  <ChartAreaStacked chartData={rawMaterialsData} 
                    fillColourA="salmon"
                    strokeColourA="red"
                    fillColourB="salmon"
                    strokeColourB="maroon"
                    />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
