"use client";

import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";

import { useClinicSetup } from "@/hooks/use-clinic-setup";
import { ApiError } from "@/lib/api";

const WEEKDAYS = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "Brasília, São Paulo, Rio (UTC-3)" },
  { value: "America/Manaus", label: "Manaus (UTC-4)" },
  { value: "America/Fortaleza", label: "Fortaleza (UTC-3)" },
  { value: "America/Recife", label: "Recife (UTC-3)" },
];

export function ClinicSetupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [averageValue, setAverageValue] = useState("");

  // Business hours state - initialize with default values
  const [businessHours, setBusinessHours] = useState<
    Record<
      string,
      {
        start: string;
        end: string;
        closed: boolean;
      }
    >
  >({
    monday: { start: "08:00", end: "18:00", closed: false },
    tuesday: { start: "08:00", end: "18:00", closed: false },
    wednesday: { start: "08:00", end: "18:00", closed: false },
    thursday: { start: "08:00", end: "18:00", closed: false },
    friday: { start: "08:00", end: "18:00", closed: false },
    saturday: { start: "08:00", end: "13:00", closed: false },
    sunday: { start: "", end: "", closed: true },
  });

  const { mutate: setup, isPending, error } = useClinicSetup();

  const [validationError, setValidationError] = useState<string | null>(null);

  function formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      // (XX) XXXX-XXXX
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      // (XX) XXXXX-XXXX
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
    }
  }

  function handlePhoneChange(value: string) {
    setContactPhone(formatPhone(value));
  }

  function handleBusinessHourChange(
    day: string,
    field: "start" | "end" | "closed",
    value: string | boolean
  ) {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    // Validate name
    if (!name || name.trim().length === 0) {
      setValidationError("Nome da clínica é obrigatório");
      return;
    }

    // Validate phone (at least 10 digits)
    const phoneDigits = contactPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setValidationError("Telefone inválido");
      return;
    }

    // Validate timezone
    if (!timezone) {
      setValidationError("Fuso horário é obrigatório");
      return;
    }

    // Validate at least one day is open
    const hasOpenDay = Object.values(businessHours).some((day) => !day.closed);
    if (!hasOpenDay) {
      setValidationError("A clínica deve estar aberta pelo menos um dia da semana");
      return;
    }

    // Validate open days have valid times
    for (const [day, hours] of Object.entries(businessHours)) {
      if (!hours.closed && (!hours.start || !hours.end)) {
        setValidationError(`Horário inválido para ${WEEKDAYS.find((w) => w.key === day)?.label}`);
        return;
      }
      if (!hours.closed && hours.start >= hours.end) {
        setValidationError(
          `Horário de abertura deve ser antes do horário de fechamento (${WEEKDAYS.find((w) => w.key === day)?.label})`
        );
        return;
      }
    }

    const setupData = {
      name: name.trim(),
      contactPhone: phoneDigits,
      ...(contactEmail.trim() && { contactEmail: contactEmail.trim() }),
      businessHours,
      timezone,
      ...(averageValue && { averageAppointmentValue: parseFloat(averageValue) }),
    };

    setup(setupData);
  }

  const errorMessage =
    validationError ||
    (error instanceof ApiError
      ? "Erro ao salvar configurações. Tente novamente."
      : error
        ? "Um erro ocorreu. Por favor, tente novamente."
        : null);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados de identificação da sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nome da Clínica *</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Clínica Exemplo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Telefone de Contato *</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={contactPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={isPending}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email de Contato</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@clinica.com.br"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    disabled={isPending}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Horário de Funcionamento *</CardTitle>
              <CardDescription>
                Defina os horários de atendimento da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {WEEKDAYS.map((weekday) => (
                  <div key={weekday.key} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-40">
                      <Checkbox
                        id={`closed-${weekday.key}`}
                        checked={businessHours[weekday.key].closed}
                        onCheckedChange={(checked) =>
                          handleBusinessHourChange(weekday.key, "closed", !!checked)
                        }
                        disabled={isPending}
                      />
                      <label
                        htmlFor={`closed-${weekday.key}`}
                        className="text-sm font-medium"
                      >
                        {weekday.label}
                      </label>
                    </div>
                    {!businessHours[weekday.key].closed && (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={businessHours[weekday.key].start}
                          onChange={(e) =>
                            handleBusinessHourChange(weekday.key, "start", e.target.value)
                          }
                          disabled={isPending}
                          className="w-32"
                        />
                        <span>até</span>
                        <Input
                          type="time"
                          value={businessHours[weekday.key].end}
                          onChange={(e) =>
                            handleBusinessHourChange(weekday.key, "end", e.target.value)
                          }
                          disabled={isPending}
                          className="w-32"
                        />
                      </div>
                    )}
                    {businessHours[weekday.key].closed && (
                      <span className="text-sm text-muted-foreground">Fechado</span>
                    )}
                  </div>
                ))}
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Adicionais</CardTitle>
              <CardDescription>
                Informações opcionais para melhor gestão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="timezone">Fuso Horário *</FieldLabel>
                  <Select
                    value={timezone}
                    onValueChange={setTimezone}
                    disabled={isPending}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="averageValue">
                    Valor Médio de Consulta (R$)
                  </FieldLabel>
                  <Input
                    id="averageValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="150.00"
                    value={averageValue}
                    onChange={(e) => setAverageValue(e.target.value)}
                    disabled={isPending}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}

          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? "Salvando..." : "Concluir configuração"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
