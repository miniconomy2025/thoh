import { Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { ModeToggle } from "../components/mode-toggle"
import { Input } from "../components/ui/input"
import { Paginator } from "../components/ui/paginator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { SidebarTrigger } from "../components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import type { Person } from "../lib/types/people.types"
import { isApiError, manageLoading } from "../lib/utils"
import simulationService from "../services/simulation.service"

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

  const [loadingState, setLoadingState] = useState<PeopleSalaryManagerLoadingState>({
    getPeople: false
  });
  const [errorState, setErrorState] = useState<PeopleSalaryManagerErrorState>({
    getPeople: undefined
  })

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
                    paginatedPeople.map((person, index) => (
                      <TableRow key={index} className={!person.phoneWorking ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{person.id}</TableCell>
                        <TableCell className="text-center">{person.phone?.model.name || "-"}</TableCell>
                        <TableCell className="text-center">{person.phone && person.phoneWorking ? "Yes" : person.phoneWorking ? "No" : "-"}</TableCell>
                        <TableCell className="text-center">{formatCurrency(person.salary)}</TableCell>
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
