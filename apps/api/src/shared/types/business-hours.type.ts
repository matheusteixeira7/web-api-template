export interface DaySchedule {
  start: string;
  end: string;
  closed: boolean;
}

export type BusinessHours = Record<string, DaySchedule>;
