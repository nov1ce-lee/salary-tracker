import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { holidaysByYear } from '@/data/holidays';
import { DayCell, DailyProgress, HolidayRecord, MonthlyWorkdaySummary, SalaryOverview, SalarySettings } from '@/types/salary';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_REGION = 'CN';

const getHolidayMap = (year: number, region = DEFAULT_REGION) => {
  if (region !== 'CN') {
    return new Map<string, HolidayRecord>();
  }

  return new Map(holidaysByYear[year]?.map((item) => [item.date, item]) ?? []);
};

export const getCurrentTime = (timezoneValue: string) => dayjs().tz(timezoneValue);

export const isWorkday = (date: dayjs.Dayjs, region = DEFAULT_REGION) => {
  const holidayMap = getHolidayMap(date.year(), region);
  const dateKey = date.format('YYYY-MM-DD');
  const isWeekend = date.day() === 0 || date.day() === 6;

  return !isWeekend && !holidayMap.has(dateKey);
};

export const getMonthlySummary = (current: dayjs.Dayjs, region = DEFAULT_REGION): MonthlyWorkdaySummary => {
  const monthStart = current.startOf('month');
  const totalDays = current.daysInMonth();
  const holidayMap = getHolidayMap(current.year(), region);

  let legalWorkdays = 0;
  let weekends = 0;

  for (let index = 0; index < totalDays; index += 1) {
    const date = monthStart.add(index, 'day');
    const dateKey = date.format('YYYY-MM-DD');
    const isWeekend = date.day() === 0 || date.day() === 6;

    if (isWeekend) {
      weekends += 1;
    }

    if (!isWeekend && !holidayMap.has(dateKey)) {
      legalWorkdays += 1;
    }
  }

  return {
    year: current.year(),
    month: current.month() + 1,
    totalDays,
    legalWorkdays,
    weekends,
    holidays: Array.from(holidayMap.keys()).filter((date) => date.startsWith(current.format('YYYY-MM'))),
  };
};

export const getLegalDailySalary = (settings: SalarySettings, legalWorkdays: number) => {
  if (!legalWorkdays) {
    return 0;
  }

  return settings.baseMonthlySalary / legalWorkdays;
};

export const getProjectedMonthlySalary = (settings: SalarySettings, legalWorkdays: number) => {
  const dailySalary = getLegalDailySalary(settings, legalWorkdays);
  return dailySalary * (legalWorkdays + settings.monthlyOvertimeDays);
};

export const getDailyProgress = (current: dayjs.Dayjs, settings: SalarySettings, legalDailySalary: number): DailyProgress => {
  const [startHour, startMinute] = settings.workSchedule.start.split(':').map(Number);
  const [endHour, endMinute] = settings.workSchedule.end.split(':').map(Number);
  const workStart = current.hour(startHour).minute(startMinute).second(0);
  const workEnd = current.hour(endHour).minute(endMinute).second(0);
  const totalMinutes = Math.max(workEnd.diff(workStart, 'minute'), 1);
  const workedMinutes = Math.min(Math.max(current.diff(workStart, 'minute'), 0), totalMinutes);
  const progress = workedMinutes / totalMinutes;

  return {
    workedMinutes,
    totalMinutes,
    progress,
    earnedToday: legalDailySalary * progress,
    remainingMinutes: Math.max(totalMinutes - workedMinutes, 0),
  };
};

export const getEarnedThisMonth = (current: dayjs.Dayjs, settings: SalarySettings, legalDailySalary: number, region = DEFAULT_REGION) => {
  const monthStart = current.startOf('month');
  let earned = 0;

  for (let index = 0; index < current.date() - 1; index += 1) {
    const date = monthStart.add(index, 'day');
    if (isWorkday(date, region)) {
      earned += legalDailySalary;
    }
  }

  if (isWorkday(current, region)) {
    earned += getDailyProgress(current, settings, legalDailySalary).earnedToday;
  }

  return earned;
};

export const getSalaryOverview = (current: dayjs.Dayjs, settings: SalarySettings): SalaryOverview => {
  const summary = getMonthlySummary(current, settings.holidayRegion);
  const legalDailySalary = getLegalDailySalary(settings, summary.legalWorkdays);
  const projectedMonthlySalary = getProjectedMonthlySalary(settings, summary.legalWorkdays);
  const earnedToday = isWorkday(current, settings.holidayRegion)
    ? getDailyProgress(current, settings, legalDailySalary).earnedToday
    : 0;
  const earnedThisMonth = getEarnedThisMonth(current, settings, legalDailySalary, settings.holidayRegion);

  return {
    legalDailySalary,
    projectedMonthlySalary,
    earnedThisMonth,
    earnedToday,
    monthlyProgress: projectedMonthlySalary ? earnedThisMonth / projectedMonthlySalary : 0,
  };
};

export const buildMonthCalendar = (current: dayjs.Dayjs, region = DEFAULT_REGION): DayCell[] => {
  const monthStart = current.startOf('month');
  const totalDays = current.daysInMonth();
  const holidayMap = getHolidayMap(current.year(), region);

  return Array.from({ length: totalDays }).map((_, index) => {
    const date = monthStart.add(index, 'day');
    const dateKey = date.format('YYYY-MM-DD');
    const holiday = holidayMap.get(dateKey);
    const weekend = date.day() === 0 || date.day() === 6;

    return {
      date: dateKey,
      day: date.date(),
      isToday: date.isSame(current, 'day'),
      isWeekend: weekend,
      isHoliday: Boolean(holiday),
      isWorkday: !weekend && !holiday,
      holidayName: holiday?.name,
    };
  });
};

export const formatCurrency = (value: number) => `¥${value.toFixed(2)}`;

export const formatMinutes = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour}小时${minute}分钟`;
};
