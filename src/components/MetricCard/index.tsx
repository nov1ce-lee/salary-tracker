import React from 'react';
import { Text, View } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
  accent?: 'violet' | 'cyan' | 'gold';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, hint, accent = 'violet' }) => {
  return (
    <View className={classnames(styles.card, styles[accent])}>
      <Text className={styles.label}>{label}</Text>
      <Text className={styles.value}>{value}</Text>
      <Text className={styles.hint}>{hint}</Text>
    </View>
  );
};

export default MetricCard;
