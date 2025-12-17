"use client";

import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";

import {
  DEFAULT_WORKING_HOURS,
  WEEKDAYS,
  type WorkingHours,
} from "@/lib/validations/provider";

/**
 * Time options for the select dropdowns (06:00 to 22:00 in 30min increments).
 */
const TIME_OPTIONS: string[] = [];
for (let hour = 6; hour <= 22; hour++) {
  TIME_OPTIONS.push(`${hour.toString().padStart(2, "0")}:00`);
  if (hour < 22) {
    TIME_OPTIONS.push(`${hour.toString().padStart(2, "0")}:30`);
  }
}

interface WorkingHoursEditorProps {
  value: WorkingHours | null;
  onChange: (hours: WorkingHours) => void;
  disabled?: boolean;
}

/**
 * Editor component for configuring working hours per day of week.
 */
export function WorkingHoursEditor({
  value,
  onChange,
  disabled,
}: WorkingHoursEditorProps) {
  const hours = value ?? DEFAULT_WORKING_HOURS;

  function handleDayToggle(dayKey: string, enabled: boolean) {
    const newHours = { ...hours };
    if (enabled) {
      newHours[dayKey] = { start: "08:00", end: "18:00" };
    } else {
      delete newHours[dayKey];
    }
    onChange(newHours);
  }

  function handleTimeChange(
    dayKey: string,
    field: "start" | "end",
    time: string
  ) {
    const dayHours = hours[dayKey];
    if (!dayHours) return;

    onChange({
      ...hours,
      [dayKey]: {
        ...dayHours,
        [field]: time,
      },
    });
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Horarios de Trabalho</div>
      <div className="rounded-lg border p-3 space-y-2">
        {WEEKDAYS.map(({ key, label }) => {
          const dayHours = hours[key];
          const isEnabled = !!dayHours;

          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-3 py-1",
                !isEnabled && "opacity-50"
              )}
            >
              <Checkbox
                id={`day-${key}`}
                checked={isEnabled}
                onCheckedChange={(checked) =>
                  handleDayToggle(key, checked === true)
                }
                disabled={disabled}
              />
              <label
                htmlFor={`day-${key}`}
                className="w-28 text-sm cursor-pointer"
              >
                {label}
              </label>

              <Select
                value={dayHours?.start ?? ""}
                onValueChange={(v) => handleTimeChange(key, "start", v)}
                disabled={disabled || !isEnabled}
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue placeholder="--:--" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground">ate</span>

              <Select
                value={dayHours?.end ?? ""}
                onValueChange={(v) => handleTimeChange(key, "end", v)}
                disabled={disabled || !isEnabled}
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue placeholder="--:--" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
