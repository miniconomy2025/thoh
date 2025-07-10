import { Day, Month } from "../../domain/shared/value-objects";

const MS_PER_MINUTE = 60 * 1000;
const SCALED_MINUTES_PER_DAY = 2;
const AVERAGE_DAYS_PER_MONTH = 30.44;
const SCALED_MINUTES_PER_MONTH = SCALED_MINUTES_PER_DAY * AVERAGE_DAYS_PER_MONTH; // ≈ 60.88

export function getScaledDate(start: Date, now: Date): { month: Month, day: Day } {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const elapsedMs = now.getTime() - start.getTime();
  const elapsedMinutes = elapsedMs / MS_PER_MINUTE;

  const totalScaledDays = elapsedMinutes / SCALED_MINUTES_PER_DAY;

  const monthIndex = Math.floor(totalScaledDays / AVERAGE_DAYS_PER_MONTH) % 12;
  const dayOfMonth = Math.floor(totalScaledDays % AVERAGE_DAYS_PER_MONTH) + 1;

  return {
    month: monthNames[monthIndex] as Month,
    day: dayOfMonth as Day
  };
}

export function calculateDaysElapsed(start: Date, now: Date): number {
  const elapsedMs = now.getTime() - start.getTime();
  const elapsedMinutes = elapsedMs / MS_PER_MINUTE;
  return Math.floor(elapsedMinutes / SCALED_MINUTES_PER_DAY) + 1;
}