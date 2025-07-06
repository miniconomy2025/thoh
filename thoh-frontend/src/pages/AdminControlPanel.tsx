import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  SidebarTrigger,
} from "../components/ui/sidebar"
import { ModeToggle } from "../components/mode-toggle"

export function AdminControlPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleStartSimulation = () => {
    setIsRunning(true)
  }

  const handleResetSimulation = () => {
    setIsRunning(false)
  }

  const formatDate = (date: Date) => {
    return date
      .toString()
      .replace(/GMT.*$/, "")
      .trim()
  }

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
                  <Button onClick={handleStartSimulation} disabled={isRunning} className="px-6 py-2">
                  Start Simulation
                  </Button>
                  <Button onClick={handleResetSimulation} disabled={!isRunning} variant="outline" className="px-6 py-2 bg-transparent">
                  Reset Simulation
                  </Button>
              </div>

              {/* System Status */}
              <Card>
                  <CardHeader>
                  <CardTitle className="text-lg text-center">System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                  </CardContent>
              </Card>
              </CardContent>
          </Card>
          </div>
      </div>
    </>
  )
}
