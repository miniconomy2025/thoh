import { useEffect, useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Checkbox } from "../components/ui/checkbox"
import { Plus, Edit, Trash2 } from "lucide-react"
import { SidebarTrigger } from "../components/ui/sidebar"
import { ModeToggle } from "../components/mode-toggle"
import { Paginator } from "../components/ui/paginator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

interface Employee {
  id: string
  name: string
  phonesAmount: number
  bankBalance: number
  monthlySalary: number
  currentPhone: string
  deceased: boolean
}

export function PeopleSalaryManager() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phonesAmount: "",
    bankBalance: "",
    monthlySalary: "",
    currentPhone: "",
    deceased: false,
  })

  const createEmployees = (count: number = 100): Employee[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: (index + 1).toString(),
      name: `Employee ${index + 1}`,
      phonesAmount: Math.floor(Math.random() * 10) + 1,
      bankBalance: Math.floor(Math.random() * 10000) + 1,
      monthlySalary: Math.floor(Math.random() * 10000) + 1,
      currentPhone: `Phone ${index + 1}`,
      deceased: Math.random() < 0.5,
    }))
  }

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setFormData({
      name: "",
      phonesAmount: "",
      bankBalance: "",
      monthlySalary: "",
      currentPhone: "",
      deceased: false,
    })
    setIsDialogOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      phonesAmount: employee.phonesAmount.toString(),
      bankBalance: employee.bankBalance.toString(),
      monthlySalary: employee.monthlySalary.toString(),
      currentPhone: employee.currentPhone,
      deceased: employee.deceased,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id))
  }

  const handleSubmit = () => {
    const newEmployee: Employee = {
      id: editingEmployee?.id || Date.now().toString(),
      name: formData.name,
      phonesAmount: Number.parseInt(formData.phonesAmount) || 0,
      bankBalance: Number.parseFloat(formData.bankBalance) || 0,
      monthlySalary: Number.parseFloat(formData.monthlySalary) || 0,
      currentPhone: formData.currentPhone,
      deceased: formData.deceased,
    }

    if (editingEmployee) {
      setEmployees(employees.map((emp) => (emp.id === editingEmployee.id ? newEmployee : emp)))
    } else {
      setEmployees([...employees, newEmployee])
    }

    setIsDialogOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  useEffect(() => {
    setEmployees(createEmployees())
  }, [])

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border mx-2" />
          <h1 className="text-lg font-semibold grow">People and salary manager</h1>
          <ModeToggle />
      </header>
      <div className="p-6 w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center flex-1">People and salary manager</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddEmployee} className="ml-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                <DialogDescription>
                  {editingEmployee ? "Update the employee information below." : "Enter the details for the new employee."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phones" className="text-right">
                    Phones
                  </Label>
                  <Input
                    id="phones"
                    type="number"
                    value={formData.phonesAmount}
                    onChange={(e) => setFormData({ ...formData, phonesAmount: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="balance" className="text-right">
                    Balance
                  </Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={formData.bankBalance}
                    onChange={(e) => setFormData({ ...formData, bankBalance: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="salary" className="text-right">
                    Salary
                  </Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.currentPhone}
                    onChange={(e) => setFormData({ ...formData, currentPhone: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deceased" className="text-right">
                    Deceased
                  </Label>
                  <Checkbox
                    id="deceased"
                    checked={formData.deceased}
                    onCheckedChange={(checked: any) => setFormData({ ...formData, deceased: checked as boolean })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>
                  {editingEmployee ? "Update" : "Add"} Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold text-center">Amount of phones purchased</TableHead>
                <TableHead className="font-semibold text-center">Bank Account Balance</TableHead>
                <TableHead className="font-semibold text-center">Monthly Salary</TableHead>
                <TableHead className="font-semibold text-center">Current phone</TableHead>
                <TableHead className="font-semibold text-center">Deceased</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No employees found. Click "Add Employee" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                employees.slice((page - 1) * pageSize, page * pageSize).map((employee) => (
                  <TableRow key={employee.id} className={employee.deceased ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell className="text-center">{employee.phonesAmount}</TableCell>
                    <TableCell className="text-center">{formatCurrency(employee.bankBalance)}</TableCell>
                    <TableCell className="text-center">{formatCurrency(employee.monthlySalary)}</TableCell>
                    <TableCell className="text-center">{employee.currentPhone}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={employee.deceased} disabled />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditEmployee(employee)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteEmployee(employee.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="w-full flex items-center justify-between">
          <Select value={pageSize.toString()} onValueChange={(value) => {
              setPage(1)
              setPageSize(Number(value))
            }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="10">10</SelectItem>
            </SelectContent>
          </Select>
          <Paginator page={page} setPage={setPage} pageSize={pageSize} dataSetLength={employees.length} />
        </div>
      </div>
    </>
  )
}
