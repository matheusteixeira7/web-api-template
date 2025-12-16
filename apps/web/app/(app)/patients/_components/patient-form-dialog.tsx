"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconCalendar, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { useCreatePatient, useUpdatePatient } from "@/hooks/use-patients";
import {
  applyCpfMask,
  formatCpf,
  getCpfFromDocuments,
} from "@/lib/utils/document";
import type { CreatePatientInput, Patient } from "@/lib/validations/patient";
import { createPatientSchema } from "@/lib/validations/patient";

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
}: PatientFormDialogProps) {
  const isEditing = !!patient;

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  const form = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      medicalRecordId: "",
      notes: "",
      cpf: "",
    },
  });

  // Reset form when dialog opens/closes or patient changes
  useEffect(() => {
    if (open) {
      if (patient) {
        const cpfValue = patient.documents
          ? getCpfFromDocuments(patient.documents)
          : null;
        form.reset({
          name: patient.name,
          phone: patient.phone,
          email: patient.email ?? "",
          dateOfBirth: patient.dateOfBirth ?? "",
          medicalRecordId: patient.medicalRecordId ?? "",
          notes: patient.notes ?? "",
          cpf: cpfValue ? formatCpf(cpfValue) : "",
        });
      } else {
        form.reset({
          name: "",
          phone: "",
          email: "",
          dateOfBirth: "",
          medicalRecordId: "",
          notes: "",
          cpf: "",
        });
      }
    }
  }, [open, patient, form]);

  async function onSubmit(data: CreatePatientInput) {
    // Clean empty strings to undefined (will be stripped from JSON)
    const cleanedData = {
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      medicalRecordId: data.medicalRecordId || undefined,
      notes: data.notes || undefined,
      cpf: data.cpf || undefined,
    };

    try {
      if (isEditing && patient) {
        await updateMutation.mutateAsync({
          id: patient.id,
          data: cleanedData,
        });
      } else {
        await createMutation.mutateAsync(cleanedData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Mutation error:", error);
      // Error already handled by onError callback in the hook
      // Keep dialog open on error
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar paciente" : "Novo paciente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informacoes do paciente."
              : "Preencha as informacoes do novo paciente."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log("=== form onSubmit triggered ===");
              console.log("form errors:", form.formState.errors);
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CPF */}
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      {...field}
                      onChange={(e) => {
                        field.onChange(applyCpfMask(e.target.value));
                      }}
                      maxLength={14}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de nascimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(parseISO(field.value), "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parseISO(field.value) : undefined}
                        onSelect={(date) =>
                          field.onChange(
                            date ? date.toISOString().split("T")[0] : ""
                          )
                        }
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medical Record ID */}
            <FormField
              control={form.control}
              name="medicalRecordId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prontuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Numero do prontuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observacoes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observacoes sobre o paciente..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
