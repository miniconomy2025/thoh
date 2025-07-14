import { Day, Month, WeekDay } from "../../domain/shared/value-objects";

const MS_PER_MINUTE = 60 * 1000;
const SCALED_MINUTES_PER_DAY = 2;
const AVERAGE_DAYS_PER_MONTH = 30.44;
const SCALED_MINUTES_PER_MONTH = SCALED_MINUTES_PER_DAY * AVERAGE_DAYS_PER_MONTH; // ≈ 60.88

export function getScaledDate(start: Date, now: Date): { month: Month, day: Day, weekday: WeekDay  } {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const elapsedMs = now.getTime() - start.getTime();
  const elapsedMinutes = elapsedMs / MS_PER_MINUTE;

  const totalScaledDays = elapsedMinutes / SCALED_MINUTES_PER_DAY;

  const monthIndex = Math.floor(totalScaledDays / AVERAGE_DAYS_PER_MONTH) % 12;
  const dayOfMonth = Math.floor(totalScaledDays % AVERAGE_DAYS_PER_MONTH) + 1;

  const weekdayIndex = Math.floor(totalScaledDays + start.getDay()) % 7;
  const weekday = weekdayNames[weekdayIndex];

  return {
    month: monthNames[monthIndex] as Month,
    day: dayOfMonth as Day,
    weekday: weekday as WeekDay
  };
}

export function calculateDaysElapsed(start: Date, now: Date): number {
  const elapsedMs = now.getTime() - start.getTime();
  const elapsedMinutes = elapsedMs / MS_PER_MINUTE;
  return Math.floor(elapsedMinutes / SCALED_MINUTES_PER_DAY) + 1;
}