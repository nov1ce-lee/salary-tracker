import React from 'react';
import { Input, Text, View } from '@tarojs/components';
import styles from './index.module.scss';

interface TimeControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TimeControl: React.FC<TimeControlProps> = ({ label, value, onChange }) => {
  return (
    <View className={styles.field}>
      <Text className={styles.label}>{label}</Text>
      <Input
        className={styles.input}
        type="text"
        value={value}
        maxlength={5}
        placeholder="09:00"
        onInput={(event) => onChange(event.detail.value)}
      />
    </View>
  );
};

export default TimeControl;
