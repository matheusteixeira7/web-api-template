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

import { useProviders } from "@/hooks/use-providers";
import type { Provider, ProvidersQueryParams } from "@/lib/validations/provider";
import { getColumns } from "./columns";
import { ProvidersFilters } from "./providers-filters";
import { ProviderFormDialog } from "./provider-form-dialog";
import { DeleteProviderDialog } from "./delete-provider-dialog";
import {
  searchParser,
  statusParser,
  specialtyParser,
  sortByParser,
  sortDirParser,
  pageParser,
  perPageParser,
} from "../search-params";

export function ProvidersTable() {
  // URL state via Nuqs
  const [params, setParams] = useQueryStates({
    search: searchParser,
    status: statusParser,
    specialty: specialtyParser,
    sortBy: sortByParser,
    sortDir: sortDirParser,
    page: pageParser,
    perPage: perPageParser,
  });

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );

  // Build query params for API
  const queryParams: ProvidersQueryParams = useMemo(
    () => ({
      search: params.search || undefined,
      status: params.status,
      specialty: params.specialty || undefined,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      page: params.page,
      perPage: params.perPage,
    }),
    [params]
  );

  // Data fetching
  const { data, isLoading, error } = useProviders(queryParams);

  // Extract unique specialties for filter dropdown
  const specialties = useMemo(() => {
    if (!data?.providers) return [];
    const specs = data.providers
      .map((p) => p.specialty)
      .filter((s): s is string => !!s);
    return [...new Set(specs)].sort();
  }, [data?.providers]);

  // Convert URL sort state to TanStack Table format
  const sorting: SortingState = useMemo(
    () => [{ id: params.sortBy, desc: params.sortDir === "desc" }],
    [params.sortBy, params.sortDir]
  );

  // Action handlers
  function handleEdit(provider: Provider) {
    setSelectedProvider(provider);
    setFormDialogOpen(true);
  }

  function handleDelete(provider: Provider) {
    setSelectedProvider(provider);
    setDeleteDialogOpen(true);
  }

  function handleCreate() {
    setSelectedProvider(null);
    setFormDialogOpen(true);
  }

  // Handle sorting change from table headers
  function handleSortingChange(newSorting: SortingState) {
    if (newSorting.length > 0) {
      const sort = newSorting[0];
      setParams({
        sortBy: sort.id as "name" | "specialty" | "createdAt",
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
    data: data?.providers ?? [],
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
        Erro ao carregar profissionais. Tente novamente.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with filters and add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ProvidersFilters specialties={specialties} />
        <Button onClick={handleCreate}>
          <IconPlus className="mr-2 h-4 w-4" />
          Novo profissional
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
                    Nenhum profissional encontrado.
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
          {data?.total ?? 0} profissional(is) encontrado(s)
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
      <ProviderFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        provider={selectedProvider}
      />
      <DeleteProviderDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        provider={selectedProvider}
      />
    </div>
  );
}
