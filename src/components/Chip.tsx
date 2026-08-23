import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';

type Props = {
  icon: IconName;
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** A single toggle-able pill, used for multi-select rows in the Symptoms Log. */
export function Chip({ icon, label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`relative flex-row items-center gap-1.5 px-3 py-2 rounded-full border-2 ${
        selected ? 'border-pink-dark bg-white' : 'border-transparent bg-[#EEEEEE]'
      }`}
    >
      <Icon name={icon} size={16} color={selected ? colors.pinkDark : colors.muted} />
      <Text className={`text-sm font-semibold ${selected ? 'text-text' : 'text-muted'}`}>{label}</Text>
      {selected && (
        <View className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-pink-dark rounded-full items-center justify-center">
          <Icon name={ICONS.check} size={11} color="white" />
        </View>
      )}
    </Pressable>
  );
}
