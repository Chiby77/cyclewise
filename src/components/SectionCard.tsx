import React from 'react';
import { View, Text } from 'react-native';
import { Chip } from './Chip';
import { Icon, type IconName } from './Icon';
import { colors } from '@/theme/colors';

type SectionCardProps = {
  icon: IconName;
  title: string;
  children: React.ReactNode;
};

export function SectionCard({ icon, title, children }: SectionCardProps) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mx-4 mb-3">
      <View className="flex-row items-center gap-2 mb-3">
        <Icon name={icon} size={20} color={colors.pinkPrimary} />
        <Text className="text-base font-bold text-text">{title}</Text>
      </View>
      {children}
    </View>
  );
}

type MultiSelectSectionProps = {
  icon: IconName;
  title: string;
  items: { icon: IconName; label: string }[];
  selected: string[];
  onToggle: (label: string) => void;
};

export function MultiSelectSection({ icon, title, items, selected, onToggle }: MultiSelectSectionProps) {
  return (
    <SectionCard icon={icon} title={title}>
      <View className="flex-row flex-wrap gap-2">
        {items.map((item) => (
          <Chip
            key={item.label}
            icon={item.icon}
            label={item.label}
            selected={selected.includes(item.label)}
            onPress={() => onToggle(item.label)}
          />
        ))}
      </View>
    </SectionCard>
  );
}
