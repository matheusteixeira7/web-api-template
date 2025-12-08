import { Calendar as CalendarComponent } from "@/components/calendar/calendar";
import { CalendarSkeleton } from "@/components/calendar/skeletons/calendar-skeleton";
import { Suspense } from "react";

export default function Calendar() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarComponent />
    </Suspense>
  );
}