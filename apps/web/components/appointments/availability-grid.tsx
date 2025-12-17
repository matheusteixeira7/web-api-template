"use client";

import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DayAvailability, TimeSlot } from "@/lib/validations/availability";
import { cn } from "@workspace/ui/lib/utils";

interface AvailabilityGridProps {
  availability: DayAvailability[];
  selectedSlot: { slot: TimeSlot; date: string } | null;
  onSlotSelect: (slot: TimeSlot, date: string) => void;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
  canNavigatePrev: boolean;
  isLoading: boolean;
}

export function AvailabilityGrid({
  availability,
  selectedSlot,
  onSlotSelect,
  onNavigateNext,
  onNavigatePrev,
  canNavigatePrev,
  isLoading,
}: AvailabilityGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onNavigatePrev}
          disabled={!canNavigatePrev}
        >
          <IconChevronLeft className="h-4 w-4 mr-1" />
          Anteriores
        </Button>
        <Button variant="outline" size="sm" onClick={onNavigateNext}>
          Proximos
          <IconChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-5 gap-2">
        {availability.map((day) => {
          const date = parseISO(day.date);
          const isToday =
            format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

          return (
            <div
              key={day.date}
              className={cn(
                "text-center p-2 rounded-md",
                isToday ? "bg-primary/10" : "bg-muted",
              )}
            >
              <div className="text-xs text-muted-foreground capitalize">
                {isToday ? "Hoje" : format(date, "EEE", { locale: ptBR })}
              </div>
              <div className="font-medium text-sm">
                {format(date, "dd/MM")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slots Grid */}
      <ScrollArea className="h-[280px]">
        <div className="grid grid-cols-5 gap-2">
          {availability.map((day) => (
            <div key={day.date} className="space-y-1">
              {day.slots.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Sem horarios
                </div>
              ) : (
                day.slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.date === day.date &&
                    selectedSlot?.slot.start === slot.start;
                  const time = format(parseISO(slot.start), "HH:mm");

                  return (
                    <Button
                      key={slot.start}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "w-full text-xs h-8",
                        isSelected && "bg-primary text-primary-foreground",
                      )}
                      onClick={() => onSlotSelect(slot, day.date)}
                    >
                      {time}
                    </Button>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
