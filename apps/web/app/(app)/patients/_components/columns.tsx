"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  IconDotsVertical,
  IconArrowUp,
  IconArrowDown,
  IconArrowsUpDown,
  IconBrandWhatsapp,
  IconMail,
} from "@tabler/icons-react";
import { format, differenceInYears, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Patient } from "@/lib/validations/patient";
import { formatPhone, getWhatsAppLink } from "@/lib/utils/phone";
import { getFormattedCpfFromDocuments } from "@/lib/utils/document";

interface ColumnActions {
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

function calculateAge(dateOfBirth: string): number {
  return differenceInYears(new Date(), parseISO(dateOfBirth));
}

export function getColumns(actions: ColumnActions): ColumnDef<Patient>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="-ml-4"
          >
            Nome
            {isSorted === "asc" ? (
              <IconArrowUp className="ml-2 h-4 w-4" />
            ) : isSorted === "desc" ? (
              <IconArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="-ml-4"
          >
            Telefone
            {isSorted === "asc" ? (
              <IconArrowUp className="ml-2 h-4 w-4" />
            ) : isSorted === "desc" ? (
              <IconArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <a
          href={getWhatsAppLink(row.original.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline"
        >
          <IconBrandWhatsapp className="h-4 w-4" />
          {formatPhone(row.original.phone)}
        </a>
      ),
    },
    {
      id: "cpf",
      header: "CPF",
      cell: ({ row }) => {
        const cpf = row.original.documents
          ? getFormattedCpfFromDocuments(row.original.documents)
          : null;
        return (
          <span className="text-muted-foreground font-mono text-sm">
            {cpf || "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="-ml-4"
          >
            Email
            {isSorted === "asc" ? (
              <IconArrowUp className="ml-2 h-4 w-4" />
            ) : isSorted === "desc" ? (
              <IconArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const email = row.original.email;
        if (!email) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
          >
            <IconMail className="h-4 w-4" />
            {email}
          </a>
        );
      },
    },
    {
      accessorKey: "dateOfBirth",
      header: "Data de Nascimento",
      cell: ({ row }) => {
        const dateOfBirth = row.original.dateOfBirth;
        if (!dateOfBirth) {
          return <span className="text-muted-foreground">-</span>;
        }
        const formattedDate = format(parseISO(dateOfBirth), "dd/MM/yyyy", {
          locale: ptBR,
        });
        const age = calculateAge(dateOfBirth);
        return (
          <span className="text-muted-foreground">
            {formattedDate}{" "}
            <span className="text-xs">({age} anos)</span>
          </span>
        );
      },
    },
    {
      accessorKey: "medicalRecordId",
      header: "Prontuario",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.medicalRecordId || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => actions.onDelete(row.original)}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
