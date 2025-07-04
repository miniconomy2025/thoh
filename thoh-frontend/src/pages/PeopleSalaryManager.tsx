import { useState } from "react"
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
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "John Doe",
      phonesAmount: 2,
      bankBalance: 15000,
      monthlySalary: 5500,
      currentPhone: "iPhone 14",
      deceased: false,
    },
    {
      id: "2",
      name: "Jane Smith",
      phonesAmount: 1,
      bankBalance: 22000,
      monthlySalary: 6200,
      currentPhone: "Samsung Galaxy S23",
      deceased: false,
    },
    {
      id: "3",
      name: "Bob Johnson",
      phonesAmount: 3,
      bankBalance: 8500,
      monthlySalary: 4800,
      currentPhone: "Google Pixel 7",
      deceased: true,
    },
  ])

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

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border mx-2" />
          <h1 className="text-lg font-semibold">People and salary manager</h1>
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
                    Bank Balance
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
                    Monthly Salary
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
                    Current Phone
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

        <div className="border rounded-lg">
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
                employees.map((employee) => (
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
      </div>
    </>
  )
}
