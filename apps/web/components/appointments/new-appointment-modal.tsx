"use client";

import { useState, useEffect } from "react";
import { addDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  IconCheck,
  IconCalendar,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { AvailabilityGrid } from "./availability-grid";
import { useProviders } from "@/hooks/use-providers";
import { usePatients } from "@/hooks/use-patients";
import { useProviderAvailability } from "@/hooks/use-provider-availability";
import { useCreateAppointment } from "@/hooks/use-create-appointment";
import type { TimeSlot } from "@/lib/validations/availability";

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalStep = 1 | 2 | 3;

export function NewAppointmentModal({
  open,
  onOpenChange,
}: NewAppointmentModalProps) {
  // Step management
  const [step, setStep] = useState<ModalStep>(1);

  // Selection state
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<{
    slot: TimeSlot;
    date: string;
  } | null>(null);

  // Date range pagination (5 days at a time)
  const [dateOffset, setDateOffset] = useState(0);

  // Search states for comboboxes
  const [providerSearch, setProviderSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");

  // Data fetching
  const { data: providersData, isLoading: providersLoading } = useProviders({
    search: providerSearch || undefined,
    perPage: 50,
  });
  const { data: patientsData, isLoading: patientsLoading } = usePatients({
    search: patientSearch || undefined,
    perPage: 50,
  });

  // Calculate date range
  const startDate = addDays(new Date(), dateOffset * 5);
  const endDate = addDays(startDate, 4);

  const { data: availabilityData, isLoading: availabilityLoading } =
    useProviderAvailability(selectedProviderId, startDate, endDate);

  const createMutation = useCreateAppointment();

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedProviderId(null);
      setSelectedPatientId(null);
      setSelectedSlot(null);
      setDateOffset(0);
      setProviderSearch("");
      setPatientSearch("");
    }
  }, [open]);

  // Get selected entities for display
  const selectedProvider = providersData?.providers.find(
    (p) => p.id === selectedProviderId,
  );
  const selectedPatient = patientsData?.patients.find(
    (p) => p.id === selectedPatientId,
  );

  // Handlers
  const handleContinueToStep2 = () => {
    if (!selectedProviderId || !selectedPatientId) {
      toast.error("Selecione um profissional e um paciente");
      return;
    }
    setStep(2);
  };

  const handleSlotSelect = (slot: TimeSlot, date: string) => {
    setSelectedSlot({ slot, date });
  };

  const handleConfirmAppointment = async () => {
    if (!selectedProviderId || !selectedPatientId || !selectedSlot) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        patientId: selectedPatientId,
        providerId: selectedProviderId,
        appointmentStart: selectedSlot.slot.start,
        appointmentEnd: selectedSlot.slot.end,
      });

      setStep(3);

      // Auto-close after success message
      setTimeout(() => {
        onOpenChange(false);
      }, 2500);
    } catch {
      // Error handled in mutation hook
    }
  };

  const handleNavigatePrev = () => {
    setDateOffset(Math.max(0, dateOffset - 1));
    setSelectedSlot(null);
  };

  const handleNavigateNext = () => {
    setDateOffset(dateOffset + 1);
    setSelectedSlot(null);
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel className="flex items-center gap-2">
                <IconUser className="h-4 w-4" />
                Profissional *
              </FieldLabel>
              <SearchableCombobox
                items={providersData?.providers ?? []}
                value={selectedProviderId}
                onValueChange={setSelectedProviderId}
                getItemId={(p) => p.id}
                getItemLabel={(p) => p.name}
                getItemDescription={(p) => p.specialty ?? undefined}
                placeholder="Selecione um profissional"
                searchPlaceholder="Buscar por nome..."
                emptyText="Nenhum profissional encontrado"
                loading={providersLoading}
                onSearchChange={setProviderSearch}
              />
            </Field>

            <Field>
              <FieldLabel className="flex items-center gap-2">
                <IconUserPlus className="h-4 w-4" />
                Paciente *
              </FieldLabel>
              <SearchableCombobox
                items={patientsData?.patients ?? []}
                value={selectedPatientId}
                onValueChange={setSelectedPatientId}
                getItemId={(p) => p.id}
                getItemLabel={(p) => p.name}
                getItemDescription={(p) => p.phone}
                placeholder="Selecione um paciente"
                searchPlaceholder="Buscar por nome ou telefone..."
                emptyText="Nenhum paciente encontrado"
                loading={patientsLoading}
                onSearchChange={setPatientSearch}
              />
            </Field>
          </FieldGroup>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Selection Summary */}
            <div className="rounded-md bg-muted p-3 text-sm space-y-1">
              <div>
                <span className="text-muted-foreground">Profissional:</span>{" "}
                <span className="font-medium">{selectedProvider?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Paciente:</span>{" "}
                <span className="font-medium">{selectedPatient?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duracao:</span>{" "}
                <span className="font-medium">
                  {availabilityData?.defaultAppointmentDuration ?? 30} min
                </span>
              </div>
            </div>

            {/* Availability Grid */}
            <AvailabilityGrid
              availability={availabilityData?.availability ?? []}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
              onNavigateNext={handleNavigateNext}
              onNavigatePrev={handleNavigatePrev}
              canNavigatePrev={dateOffset > 0}
              isLoading={availabilityLoading}
            />
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-4">
              <IconCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Consulta Agendada!</h3>
            <div className="text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">
                  {selectedPatient?.name}
                </span>
              </p>
              <p>
                com{" "}
                <span className="font-medium text-foreground">
                  {selectedProvider?.name}
                </span>
              </p>
              {selectedSlot && (
                <p className="flex items-center justify-center gap-1 mt-2">
                  <IconCalendar className="h-4 w-4" />
                  {format(
                    parseISO(selectedSlot.slot.start),
                    "dd 'de' MMMM 'as' HH:mm",
                    { locale: ptBR },
                  )}
                </p>
              )}
            </div>
          </div>
        );
    }
  };

  // Render footer actions
  const renderFooter = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleContinueToStep2}
              disabled={!selectedProviderId || !selectedPatientId}
            >
              Continuar
            </Button>
          </>
        );

      case 2:
        return (
          <>
            <Button variant="outline" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button
              onClick={handleConfirmAppointment}
              disabled={!selectedSlot || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Agendando...
                </>
              ) : (
                "Confirmar Agendamento"
              )}
            </Button>
          </>
        );

      case 3:
        return null; // No actions on success screen
    }
  };

  // Step titles
  const stepTitles: Record<ModalStep, string> = {
    1: "Nova Consulta",
    2: "Escolha o Horario",
    3: "Sucesso",
  };

  const stepDescriptions: Record<ModalStep, string> = {
    1: "Selecione o profissional e o paciente para o agendamento.",
    2: "Escolha a data e horario disponiveis.",
    3: "",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{stepTitles[step]}</DialogTitle>
          {stepDescriptions[step] && (
            <DialogDescription>{stepDescriptions[step]}</DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">{renderStepContent()}</div>

        {step !== 3 && <DialogFooter>{renderFooter()}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
