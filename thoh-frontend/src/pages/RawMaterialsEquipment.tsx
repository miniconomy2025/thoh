import { useState, useMemo, useEffect } from "react"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Search, Filter } from "lucide-react"
import { ModeToggle } from "../components/mode-toggle"
import { SidebarTrigger } from "../components/ui/sidebar"
import { isMachine, type Machine } from "../lib/types/machines.types"
import { isApiError, manageLoading } from "../lib/utils"
import simulationService from "../services/simulation.service"
import { isTruck, type Truck } from "../lib/types/truck.types"
import { isRawMaterial, type RawMaterial } from "../lib/types/rawMaterials.types"
import { Skeleton } from "../components/ui/skeleton"

interface InventoryItem {
  id: string
  category: "Raw Material" | "Transport" | "Machinery"
  itemName: string
  price: number
  stock: number
  unit: "kgs" | "units"
}

type RawMaterialsEquipmentLoadingState = {
  getMachines: boolean;
  getTrucks: boolean;
  getRawMaterials: boolean;
}

type RawMaterialsEquipmentErrorState = {
  getMachines: string | undefined;
  getTrucks: string | undefined;
  getRawMaterials: string | undefined;
}

const toInventoryItem = (item: Machine | Truck | RawMaterial): InventoryItem => {
  if (isMachine(item)) {
    return {
      id: item.machineName,
      category: "Machinery",
      itemName: item.machineName,
      price: item.price,
      stock: item.quantity,
      unit: "units"
    };
  } else if (isTruck(item)) {
    return {
      id: item.truckName,
      category: "Transport",
      itemName: item.truckName,
      price: item.price,
      stock: item.quantity,
      unit: "units"
    };
  } else if (isRawMaterial(item)) {
    return {
      id: item.rawMaterialName,
      category: "Raw Material",
      itemName: item.rawMaterialName,
      price: item.pricePerKg,
      stock: item.quantityAvailable,
      unit: "kgs"
    };
  } else {
    throw new Error("Invalid item type");
  }
}


export function RawMaterialsEquipment() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterCategory, setFilterCategory] = useState("all")
  const [loadingState, setLoadingState] = useState<RawMaterialsEquipmentLoadingState>({
    getMachines: false,
    getTrucks: false,
    getRawMaterials: false
  });
  const [errorState, setErrorState] = useState<RawMaterialsEquipmentErrorState>({
    getMachines: undefined,
    getTrucks: undefined,
    getRawMaterials: undefined
  })

  const fetchMachines = async () => {
    manageLoading<RawMaterialsEquipmentLoadingState>(['getMachines'], setLoadingState, async () => {
      try {
        const machines = await simulationService.getMachines();
        if (isApiError(machines)) {
          setErrorState((prev) => ({ ...prev, getMachines: machines.error }))
        } else {
          const machineInventory = machines.map(toInventoryItem);
          setInventory((inventory) => [...inventory, ...machineInventory]);
        }
      } catch (error) {
        setErrorState((prev) => ({ ...prev, getMachines: "Failed to fetch machines" }))
      }
    })
  }

  const fetchTrucks = async () => {
    manageLoading<RawMaterialsEquipmentLoadingState>(['getTrucks'], setLoadingState, async () => {
      try {
        const trucks = await simulationService.getTrucks();
        if (isApiError(trucks)) {
          setErrorState((prev) => ({ ...prev, getTrucks: trucks.error }))
        } else {
          const truckInventory = trucks.map(toInventoryItem);
          setInventory((inventory) => [...inventory, ...truckInventory]);
        }
      } catch (error) {
        setErrorState((prev) => ({ ...prev, getTrucks: "Failed to fetch trucks" }))
      }
    })
  }

  const fetchRawMaterials = async () => {
    manageLoading<RawMaterialsEquipmentLoadingState>(['getRawMaterials'], setLoadingState, async () => {
      try {
        const rawMaterials = await simulationService.getRawMaterials();
        if (isApiError(rawMaterials)) {
          setErrorState((prev) => ({ ...prev, getRawMaterials: rawMaterials.error }))
        } else {
          const rawMaterialInventory = rawMaterials.map(toInventoryItem);
          setInventory((inventory) => [...inventory, ...rawMaterialInventory]);
        }
      } catch (error) {
        setErrorState((prev) => ({ ...prev, getRawMaterials: "Failed to fetch raw materials" }))
      }
    })
  }

  const [inventory, setInventory] = useState<InventoryItem[]>([])

  const filteredAndSortedItems = useMemo(() => {
    const filtered = inventory.filter((item) => {
      const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || item.category === filterCategory
      return matchesSearch && matchesCategory
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.itemName.localeCompare(b.itemName)
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "stock-low":
          return a.stock - b.stock
        case "stock-high":
          return b.stock - a.stock
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })
  }, [inventory, searchTerm, sortBy, filterCategory])

  const formatCurrency = (amount: number) => {
    return `Đ ${amount.toLocaleString()}`
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Raw Material": "bg-blue-100 text-blue-800",
      Transport: "bg-green-100 text-green-800",
      Machinery: "bg-purple-100 text-purple-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const getStockStatus = (stock: number, unit: string) => {
    if (stock === 0) return { color: "text-red-600", status: "Out of Stock" }

    if (unit === "kgs") {
      if (stock < 500) return { color: "text-orange-600", status: "Low Stock" }
      return { color: "text-green-600", status: "In Stock" }
    } else {
      if (stock < 10) return { color: "text-orange-600", status: "Low Stock" }
      return { color: "text-green-600", status: "In Stock" }
    }
  }

  useEffect(() => {
    fetchMachines();
    fetchTrucks();
    fetchRawMaterials();
  }, [])

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-sidebar-border mx-2" />
        <h1 className="text-lg font-semibold grow">Admin Control Panel</h1>
        <ModeToggle />
      </header>
      <div className="p-6 w-full mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Raw Materials & Equipment</h1>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Raw Material">Raw Material</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Machinery">Machinery</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by:" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="stock-low">Stock: Low to High</SelectItem>
                <SelectItem value="stock-high">Stock: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
            </div>
          ) : (
            filteredAndSortedItems.map((item, index) => {
              const stockStatus = getStockStatus(item.stock, item.unit)
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                      <span className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.status}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Item Name: </span>
                      <span className="font-semibold">{item.itemName}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Price: </span>
                      <span className="font-semibold text-green-600">{formatCurrency(item.price)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Stock: </span>
                      <span className={`font-semibold ${stockStatus.color}`}>
                        {item.stock.toLocaleString()} {item.unit}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
          {/* Loading skeletons */}
          {loadingState.getRawMaterials ? (
            <Skeleton className="w-full" />
          ) : null}
          {loadingState.getTrucks ? (
            <Skeleton className="w-full" />
          ) : null}
          {loadingState.getMachines ? (
            <Skeleton className="w-full" />
          ) : null}
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredAndSortedItems.length}</div>
              <p className="text-sm text-gray-600">Total Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {filteredAndSortedItems.filter((item) => item.category === "Raw Material").length}
              </div>
              <p className="text-sm text-gray-600">Raw Materials</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {filteredAndSortedItems.filter((item) => item.category === "Transport").length}
              </div>
              <p className="text-sm text-gray-600">Transport</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {filteredAndSortedItems.filter((item) => item.category === "Machinery").length}
              </div>
              <p className="text-sm text-gray-600">Machinery</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
