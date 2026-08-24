import React from 'react';
import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 20, color = '#1C1C1E', style }: Props) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
