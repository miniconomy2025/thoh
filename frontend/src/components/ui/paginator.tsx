import { useEffect, useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationEllipsis, PaginationNext } from "./pagination";

export function Paginator(
    {page, setPage, pageSize, dataSetLength}:
    {page: number, setPage: (page: number) => void, pageSize: number, dataSetLength: number}
) {
    const pagesToShow = 3
    const [startPage, setStartPage] = useState(1)
    const [endPage, setEndPage] = useState(1)

    useEffect(() => {
        const totalPages = Math.ceil(dataSetLength / pageSize)
        setStartPage(Math.max(1, page - Math.floor(pagesToShow / 2)));
        setEndPage(Math.min(totalPages, page + Math.floor(pagesToShow / 2)));
    }, [dataSetLength, page, pageSize])
    return (
        <Pagination>
          <PaginationContent>
            {
                page > 1 &&
                <PaginationItem>
                    <PaginationPrevious className="cursor-pointer" onClick={() => setPage(page - 1)}/>
                </PaginationItem>
            }
            {
                page > pagesToShow - 1 &&
                <PaginationItem>
                    <PaginationLink className="cursor-pointer" onClick={() => setPage(1)}>
                        {1}
                    </PaginationLink>
                </PaginationItem>
            }
            {    
                startPage > 2 &&
                <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem>
            }
            {
                Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index).map((currentPage) => (
                <PaginationItem key={currentPage}>
                    <PaginationLink className="cursor-pointer" onClick={() => setPage(currentPage)} isActive={page === currentPage}>
                    {currentPage}
                    </PaginationLink>
                </PaginationItem>
                ))
            }
            {
                endPage < Math.ceil(dataSetLength / pageSize) - 1 &&
                <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem>
            }
            {
                page < Math.ceil(dataSetLength / pageSize) - (pagesToShow - 2) &&
                <PaginationItem>
                    <PaginationLink className="cursor-pointer" onClick={() => setPage(Math.ceil(dataSetLength / pageSize))}>
                        {Math.ceil(dataSetLength / pageSize)}
                    </PaginationLink>
                </PaginationItem>
            }
            {
                page < Math.ceil(dataSetLength / pageSize) &&
                <PaginationItem>
                    <PaginationNext className="cursor-pointer" onClick={() => setPage(page + 1)}/>
                </PaginationItem>
            }
          </PaginationContent>
        </Pagination>
    )
}