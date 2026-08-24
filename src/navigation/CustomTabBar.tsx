import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';

const TABS: { key: 'Home' | 'Calendar' | 'LogTab' | 'Statistics' | 'Profile'; label: string }[] = [
  { key: 'Home', label: 'Home' },
  { key: 'Calendar', label: 'Calendar' },
  { key: 'LogTab', label: '' },
  { key: 'Statistics', label: 'Statistics' },
  { key: 'Profile', label: 'Profile' },
];

const ICON_PAIRS = {
  Home: [ICONS.home, ICONS.homeActive],
  Calendar: [ICONS.calendar, ICONS.calendarActive],
  Statistics: [ICONS.stats, ICONS.statsActive],
  Profile: [ICONS.profile, ICONS.profileActive],
} as const;

/**
 * Recreates the original BottomNav: four regular tabs plus a raised teal
 * "+" button in the middle. The middle button doesn't switch tabs — it
 * pushes the SymptomsLog screen as a modal, same as the original design.
 */
export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-card dark:bg-dark-card border-t border-gray-100 dark:border-dark-border flex-row items-center justify-around px-2 pt-2 z-50 shadow-lg"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      {TABS.map((tab) => {
        const routeIndex = state.routes.findIndex((r) => r.name === tab.key);
        const isActive = state.index === routeIndex;

        if (tab.key === 'LogTab') {
          return (
            <Pressable
              key={tab.key}
              onPress={() => navigation.getParent()?.navigate('SymptomsLog')}
              className="w-14 h-14 bg-teal rounded-full items-center justify-center shadow-lg -mt-5 active:opacity-80 border-2 border-white dark:border-dark-card"
            >
              <Icon name={ICONS.add} size={28} color="white" />
            </Pressable>
          );
        }

        const [inactiveIcon, activeIcon] = ICON_PAIRS[tab.key];

        return (
          <Pressable
            key={tab.key}
            onPress={() => navigation.navigate(tab.key)}
            className="items-center gap-0.5 px-3 py-1 active:opacity-80"
          >
            <Icon name={isActive ? activeIcon : inactiveIcon} size={22} color={isActive ? colors.teal : '#9CA3AF'} />
            <Text className={`text-[10px] font-semibold ${isActive ? 'text-teal' : 'text-gray-400 dark:text-dark-muted'}`}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
