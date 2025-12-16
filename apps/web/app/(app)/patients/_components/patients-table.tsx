"use client";

import { useState, useMemo } from "react";
import { useQueryStates } from "nuqs";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLoader2,
} from "@tabler/icons-react";

import { usePatients } from "@/hooks/use-patients";
import type { Patient, PatientsQueryParams } from "@/lib/validations/patient";
import { getColumns } from "./columns";
import { PatientsFilters } from "./patients-filters";
import { PatientFormDialog } from "./patient-form-dialog";
import { DeletePatientDialog } from "./delete-patient-dialog";
import {
  searchParser,
  sortByParser,
  sortDirParser,
  pageParser,
  perPageParser,
} from "../search-params";

export function PatientsTable() {
  // URL state via Nuqs
  const [params, setParams] = useQueryStates({
    search: searchParser,
    sortBy: sortByParser,
    sortDir: sortDirParser,
    page: pageParser,
    perPage: perPageParser,
  });

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Build query params for API
  const queryParams: PatientsQueryParams = useMemo(
    () => ({
      search: params.search || undefined,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      page: params.page,
      perPage: params.perPage,
    }),
    [params]
  );

  // Data fetching
  const { data, isLoading, error } = usePatients(queryParams);

  // Convert URL sort state to TanStack Table format
  const sorting: SortingState = useMemo(
    () => [{ id: params.sortBy, desc: params.sortDir === "desc" }],
    [params.sortBy, params.sortDir]
  );

  // Action handlers
  function handleEdit(patient: Patient) {
    setSelectedPatient(patient);
    setFormDialogOpen(true);
  }

  function handleDelete(patient: Patient) {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  }

  function handleCreate() {
    setSelectedPatient(null);
    setFormDialogOpen(true);
  }

  // Handle sorting change from table headers
  function handleSortingChange(newSorting: SortingState) {
    if (newSorting.length > 0) {
      const sort = newSorting[0];
      setParams({
        sortBy: sort.id as "name" | "phone" | "email" | "createdAt",
        sortDir: sort.desc ? "desc" : "asc",
        page: 1, // Reset to first page on sort change
      });
    }
  }

  // Column definitions with actions
  const columns = useMemo(
    () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    []
  );

  // Table instance
  const table = useReactTable({
    data: data?.patients ?? [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      handleSortingChange(newSorting);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true, // Server-side sorting
    manualPagination: true, // Server-side pagination
  });

  // Pagination helpers (ensure at least 1 page for display)
  const totalPages = Math.max(data?.totalPages ?? 0, 1);
  const currentPage = params.page;

  function goToPage(page: number) {
    setParams({ page });
  }

  function handlePerPageChange(value: string) {
    setParams({ perPage: Number(value), page: 1 });
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive">
        Erro ao carregar pacientes. Tente novamente.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with filters and add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PatientsFilters />
        <Button onClick={handleCreate}>
          <IconPlus className="mr-2 h-4 w-4" />
          Novo paciente
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhum paciente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {data?.total ?? 0} paciente(s) encontrado(s)
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Linhas por pagina</span>
            <Select
              value={params.perPage.toString()}
              onValueChange={handlePerPageChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm">
            Pagina {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(1)}
              disabled={currentPage <= 1}
            >
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage >= totalPages}
            >
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <PatientFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        patient={selectedPatient}
      />
      <DeletePatientDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        patient={selectedPatient}
      />
    </div>
  );
}
