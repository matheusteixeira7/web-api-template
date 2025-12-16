"use client";

import { useQueryState } from "nuqs";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { IconSearch, IconX } from "@tabler/icons-react";
import {
  searchParser,
  statusParser,
  specialtyParser,
  pageParser,
  type StatusFilter,
} from "../search-params";

interface ProvidersFiltersProps {
  specialties: string[];
}

export function ProvidersFilters({ specialties }: ProvidersFiltersProps) {
  const [search, setSearch] = useQueryState("search", searchParser);
  const [status, setStatus] = useQueryState("status", statusParser);
  const [specialty, setSpecialty] = useQueryState("specialty", specialtyParser);
  const [, setPage] = useQueryState("page", pageParser);

  const hasFilters = search || status !== "all" || specialty;

  function handleSearchChange(value: string) {
    setSearch(value || null);
    setPage(1); // Reset to first page when search changes
  }

  function handleStatusChange(value: string) {
    setStatus(value as StatusFilter);
    setPage(1); // Reset to first page when filter changes
  }

  function handleSpecialtyChange(value: string) {
    setSpecialty(value === "all" ? null : value);
    setPage(1); // Reset to first page when filter changes
  }

  function clearFilters() {
    setSearch(null);
    setStatus("all");
    setSpecialty(null);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1 max-w-sm">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status filter */}
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
        </SelectContent>
      </Select>

      {/* Specialty filter */}
      {specialties.length > 0 && (
        <Select
          value={specialty || "all"}
          onValueChange={handleSpecialtyChange}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Especialidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas especialidades</SelectItem>
            {specialties.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <IconX className="mr-2 h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
