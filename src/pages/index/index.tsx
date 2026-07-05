import React from 'react';
import { Button, Input, ScrollView, Text, View } from '@tarojs/components';
import MetricCard from '@/components/MetricCard';
import NeonProgress from '@/components/NeonProgress';
import TimeControl from '@/components/TimeControl';
import { useSalaryDashboard } from '@/hooks/useSalaryDashboard';
import { formatCurrency, formatMinutes } from '@/utils/salary';
import styles from './index.module.scss';

const IndexPage: React.FC = () => {
  const {
    now,
    settings,
    monthlySummary,
    overview,
    dailyProgress,
    calendar,
    updateSetting,
    updateSchedule,
    notifySaved,
  } = useSalaryDashboard();

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.hero}>
        <View className={styles.orbitPrimary} />
        <View className={styles.orbitSecondary} />
        <Text className={styles.heroEyebrow}>WAGE COSMOS</Text>
        <Text className={styles.heroTitle}>你的工资，像星云一样实时生长。</Text>
        <Text className={styles.heroText}>
          当前时区 {settings.timezone} · {now.format('YYYY年MM月DD日 HH:mm:ss')}
        </Text>
        <View className={styles.heroBadge}>
          <Text className={styles.heroBadgeLabel}>本月法定工作日</Text>
          <Text className={styles.heroBadgeValue}>{monthlySummary.legalWorkdays} 天</Text>
        </View>
      </View>

      <View className={styles.metricsGrid}>
        <MetricCard
          label="今日累计"
          value={formatCurrency(overview.earnedToday)}
          hint={`已工作 ${formatMinutes(dailyProgress.workedMinutes)}`}
          accent="violet"
        />
        <MetricCard
          label="本月累计"
          value={formatCurrency(overview.earnedThisMonth)}
          hint={`预计到手 ${formatCurrency(overview.projectedMonthlySalary)}`}
          accent="cyan"
        />
        <MetricCard
          label="法定日薪"
          value={formatCurrency(overview.legalDailySalary)}
          hint={`加班折算 ${settings.monthlyOvertimeDays} 天`}
          accent="gold"
        />
      </View>

      <NeonProgress
        title="今日进度条"
        subtitle={`距离下班还有 ${formatMinutes(dailyProgress.remainingMinutes)} · 日程 ${settings.workSchedule.start} - ${settings.workSchedule.end}`}
        value={dailyProgress.progress}
      />

      <NeonProgress
        title="本月工资进度"
        subtitle={`累计完成 ${formatCurrency(overview.earnedThisMonth)} / ${formatCurrency(overview.projectedMonthlySalary)}`}
        value={overview.monthlyProgress}
      />

      <View className={styles.panel}>
        <View className={styles.panelHeader}>
          <Text className={styles.panelTitle}>薪资引擎参数</Text>
          <Text className={styles.panelDesc}>按照基础月薪 ÷ 月法定工作日 ×（月法定工作日 + 加班天数）计算</Text>
        </View>

        <View className={styles.fieldGroup}>
          <View className={styles.field}>
            <Text className={styles.fieldLabel}>基础月薪</Text>
            <Input
              className={styles.numberInput}
              type="digit"
              value={String(settings.baseMonthlySalary)}
              onInput={(event) => updateSetting('baseMonthlySalary', Number(event.detail.value || 0))}
            />
          </View>
          <View className={styles.field}>
            <Text className={styles.fieldLabel}>月加班天数</Text>
            <Input
              className={styles.numberInput}
              type="digit"
              value={String(settings.monthlyOvertimeDays)}
              onInput={(event) => updateSetting('monthlyOvertimeDays', Number(event.detail.value || 0))}
            />
          </View>
        </View>

        <View className={styles.fieldGroup}>
          <TimeControl label="上班时间" value={settings.workSchedule.start} onChange={(value) => updateSchedule('start', value)} />
          <TimeControl label="下班时间" value={settings.workSchedule.end} onChange={(value) => updateSchedule('end', value)} />
        </View>

        <Button className={styles.actionButton} onClick={notifySaved}>
          保存并继续追踪工资流动
        </Button>
      </View>

      <View className={styles.panel}>
        <View className={styles.panelHeader}>
          <Text className={styles.panelTitle}>法定工作日矩阵</Text>
          <Text className={styles.panelDesc}>自动剔除周末与中国法定节假日，当前月份共 {monthlySummary.legalWorkdays} 个有效工作日。</Text>
        </View>
        <View className={styles.calendarGrid}>
          {calendar.map((item) => (
            <View
              key={item.date}
              className={styles.dayCell}
              style={{
                opacity: item.isWorkday ? 1 : 0.58,
                background: item.isToday
                  ? 'linear-gradient(135deg, #7c4dff 0%, #2fe5ff 100%)'
                  : item.isHoliday
                    ? 'rgba(255, 111, 145, 0.16)'
                    : 'rgba(255, 255, 255, 0.72)',
              }}
            >
              <Text className={styles.dayNumber}>{item.day}</Text>
              <Text className={styles.dayTag}>{item.isHoliday ? item.holidayName : item.isWorkday ? '工作日' : '周末'}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default IndexPage;
