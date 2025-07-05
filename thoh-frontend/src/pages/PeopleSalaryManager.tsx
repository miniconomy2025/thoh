import { useEffect, useMemo, useState } from "react"
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
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { SidebarTrigger } from "../components/ui/sidebar"
import { ModeToggle } from "../components/mode-toggle"
import { Paginator } from "../components/ui/paginator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog"

interface Person {
  id: string
  name: string
  phonesAmount: number
  bankBalance: number
  monthlySalary: number
  currentPhone: string
  deceased: boolean
}

export function PeopleSalaryManager() {
  const [searchTerm, setSearchTerm] = useState("")
  const [people, setPeople] = useState<Person[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phonesAmount: "",
    bankBalance: "",
    monthlySalary: "",
    currentPhone: "",
    deceased: false,
  })

  function generateRandomName() {
  const firstNames = [
    "Alex", "Jordan", "Taylor", "Casey", "Riley", "Scott", "Luke", "John", "Mike",
    "Morgan", "Jamie", "Avery", "Drew", "Skyler"
  ];

  const lastNames = [
    "Smith", "Johnson", "Brown", "Taylor", "Anderson",
    "Thomas", "Jackson", "White", "Harris", "Martin"
  ];

  const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];

  return `${randomFirst} ${randomLast}`;
}

  const createPersons = (count: number = 100): Person[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: (index + 1).toString(),
      name: generateRandomName(),
      phonesAmount: Math.floor(Math.random() * 10) + 1,
      bankBalance: Math.floor(Math.random() * 10000) + 1,
      monthlySalary: Math.floor(Math.random() * 100000) + 1,
      currentPhone: `Phone ${index + 1}`,
      deceased: Math.random() < 0.5,
    }))
  }

  const handleAddPerson = () => {
    setEditingPerson(null)
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

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person)
    setFormData({
      name: person.name,
      phonesAmount: person.phonesAmount.toString(),
      bankBalance: person.bankBalance.toString(),
      monthlySalary: person.monthlySalary.toString(),
      currentPhone: person.currentPhone,
      deceased: person.deceased,
    })
    setIsDialogOpen(true)
  }

  const handleDeletePerson = (id: string) => {
    setPeople(people.filter((person) => person.id !== id))
  }

  const handleSubmit = () => {
    const newPerson: Person = {
      id: editingPerson?.id || Date.now().toString(),
      name: formData.name,
      phonesAmount: Number.parseInt(formData.phonesAmount) || 0,
      bankBalance: Number.parseFloat(formData.bankBalance) || 0,
      monthlySalary: Number.parseFloat(formData.monthlySalary) || 0,
      currentPhone: formData.currentPhone,
      deceased: formData.deceased,
    }

    if (editingPerson) {
      setPeople(people.map((person) => (person.id === editingPerson.id ? newPerson : person)))
    } else {
      setPeople([...people, newPerson])
    }

    setIsDialogOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount)
  }

  useEffect(() => {
    setPeople(createPersons())
  }, [])

  const searchedPeople = useMemo(() => {
    return people.filter((person) => person.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm, people])

  const paginatedPeople = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return searchedPeople.slice(startIndex, endIndex)
  }, [searchedPeople, page, pageSize])

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border mx-2" />
          <h1 className="text-lg font-semibold grow">People and salary manager</h1>
          <ModeToggle />
      </header>
      <div className="p-6 w-full mx-auto">
        <h1 className="text-3xl font-bold text-center flex-1 mb-6">People and salary manager</h1>

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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddPerson} className="ml-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Person
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingPerson ? "Edit Person" : "Add New Person"}</DialogTitle>
                <DialogDescription>
                  {editingPerson ? "Update the person information below." : "Enter the details for the new person."}
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
                  {editingPerson ? "Update" : "Add"} Person
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
              {people.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No person found. Click "Add Person" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPeople.map((person) => (
                  <TableRow key={person.id} className={person.deceased ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell className="text-center">{person.phonesAmount}</TableCell>
                    <TableCell className="text-center">{formatCurrency(person.bankBalance)}</TableCell>
                    <TableCell className="text-center">{formatCurrency(person.monthlySalary)}</TableCell>
                    <TableCell className="text-center">{person.currentPhone}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={person.deceased} disabled />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditPerson(person)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                          </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete {person.name} from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600" onClick={() => handleDeletePerson(person.id)}>Yes, delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
              <SelectItem value="5">5</SelectItem>
            </SelectContent>
          </Select>
          <Paginator page={page} setPage={setPage} pageSize={pageSize} dataSetLength={searchedPeople.length} />
        </div>
      </div>
    </>
  )
}
