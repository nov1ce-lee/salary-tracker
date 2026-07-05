export interface TimeRange {
  start: string;
  end: string;
}

export interface SalarySettings {
  baseMonthlySalary: number;
  monthlyOvertimeDays: number;
  workSchedule: TimeRange;
  timezone: string;
  holidayRegion: string;
}

export interface DailyProgress {
  workedMinutes: number;
  totalMinutes: number;
  progress: number;
  earnedToday: number;
  remainingMinutes: number;
}

export interface MonthlyWorkdaySummary {
  year: number;
  month: number;
  totalDays: number;
  legalWorkdays: number;
  weekends: number;
  holidays: string[];
}

export interface SalaryOverview {
  legalDailySalary: number;
  projectedMonthlySalary: number;
  earnedThisMonth: number;
  earnedToday: number;
  monthlyProgress: number;
}

export interface HolidayRecord {
  date: string;
  name: string;
}

export interface DayCell {
  date: string;
  day: number;
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  isWorkday: boolean;
  holidayName?: string;
}
