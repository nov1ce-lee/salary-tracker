import { useEffect, useMemo, useState } from 'react';
import Taro from '@tarojs/taro';
import { buildMonthCalendar, getCurrentTime, getDailyProgress, getMonthlySummary, getSalaryOverview } from '@/utils/salary';
import { SalarySettings } from '@/types/salary';

const defaultSettings: SalarySettings = {
  baseMonthlySalary: 12000,
  monthlyOvertimeDays: 2,
  workSchedule: {
    start: '09:00',
    end: '18:30',
  },
  timezone: 'Asia/Shanghai',
  holidayRegion: 'CN',
};

export const useSalaryDashboard = () => {
  const [settings, setSettings] = useState<SalarySettings>(defaultSettings);
  const [now, setNow] = useState(() => getCurrentTime(defaultSettings.timezone));

  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || defaultSettings.timezone;
      setSettings((prev) => ({ ...prev, timezone }));
      setNow(getCurrentTime(timezone));
      console.info('[SalaryDashboard] timezone resolved', timezone);
    } catch (error) {
      console.error('[SalaryDashboard] failed to resolve timezone', error);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(getCurrentTime(settings.timezone));
    }, 1000);

    // eslint-disable-next-line react-hooks/exhaustive-deps

    return () => clearInterval(timer);
  }, [settings.timezone]);

  const monthlySummary = useMemo(() => getMonthlySummary(now, settings.holidayRegion), [now, settings.holidayRegion]);
  const overview = useMemo(() => getSalaryOverview(now, settings), [now, settings]);
  const dailyProgress = useMemo(() => {
    const [startHour, startMinute] = settings.workSchedule.start.split(':').map(Number);
    const [endHour, endMinute] = settings.workSchedule.end.split(':').map(Number);
    const validTime = [startHour, startMinute, endHour, endMinute].every((value) => Number.isFinite(value));

    if (!validTime) {
      return {
        workedMinutes: 0,
        totalMinutes: 1,
        progress: 0,
        earnedToday: 0,
        remainingMinutes: 0,
      };
    }

    return getDailyProgress(now, settings, overview.legalDailySalary);
  }, [now, settings, overview.legalDailySalary]);
  const calendar = useMemo(() => buildMonthCalendar(now, settings.holidayRegion), [now, settings.holidayRegion]);

  const updateSetting = <K extends keyof SalarySettings>(key: K, value: SalarySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateSchedule = (type: 'start' | 'end', value: string) => {
    setSettings((prev) => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        [type]: value,
      },
    }));
  };

  const notifySaved = () => {
    Taro.showToast({ title: '参数已更新', icon: 'success' });
  };

  return {
    now,
    settings,
    monthlySummary,
    overview,
    dailyProgress,
    calendar,
    updateSetting,
    updateSchedule,
    notifySaved,
  };
};
