import { Edit, Plus, Search, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { ModeToggle } from "../components/mode-toggle"
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
import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Paginator } from "../components/ui/paginator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { SidebarTrigger } from "../components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import type { Person } from "../lib/types/people.types"
import { isApiError, manageLoading } from "../lib/utils"
import simulationService from "../services/simulation.service"

type EditPersonFormData = {
  salary: number;
  phoneModel: string | undefined;
  phoneWorking: boolean;
}

type PeopleSalaryManagerLoadingState = {
  getPeople: boolean
}

type PeopleSalaryManagerErrorState = {
  getPeople: string | undefined
}

export function PeopleSalaryManager() {
  const [searchTerm, setSearchTerm] = useState("")
  const [people, setPeople] = useState<Person[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [formData, setFormData] = useState<EditPersonFormData>({
    salary: 0,
    phoneModel: "",
    phoneWorking: false
  });

  const [loadingState, setLoadingState] = useState<PeopleSalaryManagerLoadingState>({
    getPeople: false
  });
  const [errorState, setErrorState] = useState<PeopleSalaryManagerErrorState>({
    getPeople: undefined
  })

  const handleAddPerson = () => {
    setEditingPerson(null)
    setFormData({
      salary: 0,
      phoneModel: "",
      phoneWorking: false
    })
    setIsDialogOpen(true)
  }

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person)
    setFormData({
      salary: person.salary,
      phoneModel: person.phone?.model,
      phoneWorking: person.phoneWorking
    })
    setIsDialogOpen(true)
  }

  const handleDeletePerson = (id: number) => {
    setPeople(people.filter((person) => person.id !== id))
  }

  const handleSubmit = () => {
    const newPerson: Person = {
      id: editingPerson ? editingPerson.id : people.length + 1,
      salary: formData.salary,
      phone: {
        id: editingPerson?.phone?.id ?? 1,
        model: formData.phoneModel ?? "",
        isBroken: formData.phoneWorking
      },
      phoneWorking: formData.phoneWorking
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
    manageLoading<PeopleSalaryManagerLoadingState>(
      ['getPeople'], 
      setLoadingState, 
      async () => {
        try {
          const people = await simulationService.getPeople();
          if (isApiError(people)) {
            setErrorState((prev) => ({ ...prev, getPeople: people.error }))
            setPeople([])
          } else {
            setErrorState((prev) => ({ ...prev, getPeople: undefined }))
            setPeople(people)
          }
        } catch (error) {
          setErrorState((prev) => ({ ...prev, getPeople: (error as Error).message }));
        }
    });
  }, [])

  const searchedPeople = useMemo(() => {
    return people.filter((person) => String(person.id).toLowerCase().includes(searchTerm.toLowerCase()))
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
                  <Label htmlFor="salary" className="text-right">
                    Salary
                  </Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone Model
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phoneModel}
                    onChange={(e) => setFormData({ ...formData, phoneModel: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deceased" className="text-right">
                    Phone Working
                  </Label>
                  <Checkbox
                    id="deceased"
                    checked={formData.phoneWorking}
                    onCheckedChange={(checked: any) => setFormData({ ...formData, phoneWorking: checked as boolean })}
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

        {errorState.getPeople ? 
          <div className="border rounded-lg mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {errorState.getPeople}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          :
          <>
            <div className="border rounded-lg mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Phone Model</TableHead>
                    <TableHead className="font-semibold">Phone Working</TableHead>
                    <TableHead className="font-semibold">Salary</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingState.getPeople && <TableRow><TableCell colSpan={7} className="text-center py-8">Getting people...</TableCell></TableRow>}
                  {!loadingState.getPeople && people.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No person found. Click "Add Person" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPeople.map((person) => (
                      <TableRow key={person.id} className={person.phoneWorking ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{person.id}</TableCell>
                        <TableCell className="text-center">{person.phone?.model}</TableCell>
                        <TableCell className="text-center">{person.phoneWorking}</TableCell>
                        <TableCell className="text-center">{formatCurrency(person.salary)}</TableCell>
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
                                    This action cannot be undone. This will permanently delete ID: {person.id} from our servers.
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
          </>
        }
      </div>
    </>
  )
}
