import React from 'react';
import { Text, View } from '@tarojs/components';
import styles from './index.module.scss';

interface NeonProgressProps {
  title: string;
  subtitle: string;
  value: number;
}

const NeonProgress: React.FC<NeonProgressProps> = ({ title, subtitle, value }) => {
  const percent = Math.max(0, Math.min(value, 1)) * 100;

  return (
    <View className={styles.panel}>
      <View className={styles.header}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.percent}>{percent.toFixed(1)}%</Text>
      </View>
      <Text className={styles.subtitle}>{subtitle}</Text>
      <View className={styles.track}>
        <View className={styles.bar} style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
};

export default NeonProgress;
