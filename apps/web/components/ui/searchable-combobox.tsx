"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Spinner } from "@workspace/ui/components/spinner";

interface SearchableComboboxProps<T> {
  items: T[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
  getItemDescription?: (item: T) => string | undefined;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  onSearchChange?: (search: string) => void;
}

export function SearchableCombobox<T>({
  items,
  value,
  onValueChange,
  getItemId,
  getItemLabel,
  getItemDescription,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhum resultado encontrado.",
  disabled = false,
  loading = false,
  onSearchChange,
}: SearchableComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = items.find((item) => getItemId(item) === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="truncate">
            {selectedItem ? getItemLabel(selectedItem) : placeholder}
          </span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={!onSearchChange}>
          <CommandInput
            placeholder={searchPlaceholder}
            onValueChange={onSearchChange}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Spinner className="h-4 w-4" />
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  {items.map((item) => {
                    const itemId = getItemId(item);
                    const isSelected = value === itemId;
                    const description = getItemDescription?.(item);

                    return (
                      <CommandItem
                        key={itemId}
                        value={getItemLabel(item)}
                        onSelect={() => {
                          onValueChange(isSelected ? null : itemId);
                          setOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{getItemLabel(item)}</span>
                          {description && (
                            <span className="text-xs text-muted-foreground">
                              {description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
