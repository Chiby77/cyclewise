import React from 'react';
import { View, Text } from 'react-native';
import { Icon, type IconName } from './Icon';
import { colors } from '@/theme/colors';

type Props = {
  label: string;
  value: string;
  unit: string;
  icon: IconName;
};

export function StatCard({ label, value, unit, icon }: Props) {
  return (
    <View className="bg-white rounded-2xl p-3 items-center gap-1 shadow-sm flex-1">
      <Text className="text-xs font-bold text-text">{label}</Text>
      <Icon name={icon} size={22} color={colors.pinkPrimary} />
      <Text className="text-xs font-semibold text-text">
        {value} <Text className="text-muted">{unit}</Text>
      </Text>
    </View>
  );
}
