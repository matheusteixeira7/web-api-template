"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@workspace/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useCreateProvider, useUpdateProvider } from "@/hooks/use-providers";
import {
  createProviderSchema,
  type Provider,
  type CreateProviderInput,
} from "@/lib/validations/provider";

/**
 * Common specialties in Brazilian clinics.
 */
const SPECIALTIES = [
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Ginecologia",
  "Neurologia",
  "Oftalmologia",
  "Ortopedia",
  "Pediatria",
  "Psicologia",
  "Psiquiatria",
  "Urologia",
  "Clinico Geral",
  "Fisioterapia",
  "Nutricao",
  "Odontologia",
];

/**
 * Appointment duration options in minutes.
 */
const DURATION_OPTIONS = [15, 20, 30, 40, 45, 60, 90, 120];

interface ProviderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: Provider | null;
}

export function ProviderFormDialog({
  open,
  onOpenChange,
  provider,
}: ProviderFormDialogProps) {
  const isEditMode = !!provider;

  // Form state (following codebase useState pattern)
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState<string>("");
  const [duration, setDuration] = useState(30);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateProvider();
  const updateMutation = useUpdateProvider();

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Reset form when dialog opens/closes or provider changes
  useEffect(() => {
    if (open) {
      if (provider) {
        setName(provider.name);
        setSpecialty(provider.specialty || "");
        setDuration(provider.defaultAppointmentDuration);
      } else {
        setName("");
        setSpecialty("");
        setDuration(30);
      }
      setErrors({});
    }
  }, [open, provider]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const formData: CreateProviderInput = {
      name: name.trim(),
      specialty: specialty || undefined,
      defaultAppointmentDuration: duration,
    };

    // Validate with Zod
    const result = createProviderSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (isEditMode && provider) {
      updateMutation.mutate(
        { id: provider.id, data: formData },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize as informacoes do profissional."
              : "Adicione um novo profissional a sua clinica."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="name">Nome *</FieldLabel>
              <Input
                id="name"
                placeholder="Dr. Joao Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="specialty">Especialidade</FieldLabel>
              <Select
                value={specialty}
                onValueChange={setSpecialty}
                disabled={isPending}
              >
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Selecione uma especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="duration">
                Duracao padrao da consulta (minutos) *
              </FieldLabel>
              <Select
                value={duration.toString()}
                onValueChange={(val) => setDuration(Number(val))}
                disabled={isPending}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((mins) => (
                    <SelectItem key={mins} value={mins.toString()}>
                      {mins} minutos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.defaultAppointmentDuration && (
                <FieldError>{errors.defaultAppointmentDuration}</FieldError>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : isEditMode
                  ? "Salvar"
                  : "Criar profissional"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
