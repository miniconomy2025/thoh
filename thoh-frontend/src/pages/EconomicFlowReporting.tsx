

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { ScrollArea } from "../components/ui/scroll-area"
import { Badge } from "../components/ui/badge"
import { TrendingUp, TrendingDown, Activity, Clock } from "lucide-react"
import { SidebarTrigger } from "../components/ui/sidebar"
import { ModeToggle } from "../components/mode-toggle"

interface Entity {
  id: string
  type: string
  name: string
  accountValue: number
}

interface ActivityItem {
  id: string
  time: string
  description: string
  amount?: number
}

export function EconomicFlowReporting() {
  const [currentDay, setCurrentDay] = useState(1)
  const [totalEconomyValue, setTotalEconomyValue] = useState(2450000)
  const [totalTrades, setTotalTrades] = useState(156)

  const [entities] = useState<Entity[]>([
    { id: "1", type: "Supplier", name: "Global Materials Ltd", accountValue: 450000 },
    { id: "2", type: "Logistics", name: "FastTrans Corp", accountValue: 125000 },
    { id: "3", type: "Retail Bank", name: "RetailBank1", accountValue: 890000 },
    { id: "4", type: "Commercial Bank", name: "CommercialBank Pro", accountValue: 1200000 },
    { id: "5", type: "Phone Companies", name: "TechPhone Inc", accountValue: 340000 },
    { id: "6", type: "Recycler", name: "EcoRecycle Solutions", accountValue: 85000 },
  ])

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: "1", time: "12:00", description: "Pear paid R 12,000 to BulkTrans", amount: 12000 },
    { id: "2", time: "14:03", description: "RetailBank1 loaned R 10,000 to a person", amount: 10000 },
    { id: "3", time: "15:20", description: "Someone sold phone to consumer for R 6,000", amount: 6000 },
    { id: "4", time: "15:55", description: "Material shipment received by Supplier", amount: 25000 },
    { id: "5", time: "16:12", description: "Phone manufacturing completed", amount: 8500 },
    { id: "6", time: "16:45", description: "Recycling process initiated for old devices", amount: 3200 },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDay((prev) => prev + 1)

      // Simulate new activity
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
        description: `Automated transaction processed`,
        amount: Math.floor(Math.random() * 50000) + 1000,
      }

      setActivities((prev) => [newActivity, ...prev.slice(0, 9)])
      setTotalTrades((prev) => prev + 1)
      setTotalEconomyValue((prev) => {
        const change = Math.floor(Math.random() * 10000) - 5000
        return prev + change
      })
    }, 2000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return `R ${amount.toLocaleString()}`
  }

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
              <div className="text-2xl font-bold">{formatCurrency(totalEconomyValue)}</div>
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
                        <TableCell className="font-medium">{entity.name}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(entity.accountValue)}</TableCell>
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
                          <p className="text-sm text-gray-900 mt-1">{activity.description}</p>
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
                <CardTitle className="text-sm">Cash Balance over time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div className="text-sm text-muted-foreground">Chart Placeholder</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Phone Sales Per Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-8 w-8 text-blue-500" />
                    <div className="text-sm text-muted-foreground">Chart Placeholder</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Raw Material Sold per Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-8 w-8 text-orange-500" />
                    <div className="text-sm text-muted-foreground">Chart Placeholder</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
