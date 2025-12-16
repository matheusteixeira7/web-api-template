"use client";

import { useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { IconSearch, IconX } from "@tabler/icons-react";
import { searchParser, pageParser } from "../search-params";

export function PatientsFilters() {
  const [search, setSearch] = useQueryState("search", searchParser);
  const [, setPage] = useQueryState("page", pageParser);

  // Local state for immediate input feedback
  const [localSearch, setLocalSearch] = useState(search);

  // Debounced URL update (500ms)
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value || null);
    setPage(1);
  }, 500);

  // Sync local state when URL changes externally
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  function handleSearchChange(value: string) {
    setLocalSearch(value);
    debouncedSetSearch(value);
  }

  function clearFilters() {
    setLocalSearch("");
    debouncedSetSearch.cancel();
    setSearch(null);
    setPage(1);
  }

  const hasFilters = !!localSearch;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1 max-w-md">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone, CPF, email ou prontuario..."
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <IconX className="mr-2 h-4 w-4" />
          Limpar busca
        </Button>
      )}
    </div>
  );
}
