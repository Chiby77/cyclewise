import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCycleData } from '@/hooks/useCycleData';

export function StatisticsScreen() {
  const { currentCycleDay, cycleLength, periodLength, cycleHistory } = useCycleData(new Date());

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={['top']} className="bg-white px-4 pb-4">
        <Text className="text-xl font-extrabold text-text pt-2">Statistics</Text>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4" contentContainerClassName="py-4 pb-24">
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
          <Text className="font-extrabold text-text mb-1">
            Current cycle: {currentCycleDay} Days
          </Text>
          <Text className="text-xs text-muted font-semibold mb-4">
            Goal: {cycleLength} days ({periodLength} period days)
          </Text>

          {cycleHistory.map((cycle) => (
            <View key={cycle.label} className="mb-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs font-semibold text-muted">{cycle.label}</Text>
                <Text className="text-xs font-semibold text-muted">{cycle.total} days</Text>
              </View>
              <View className="h-5 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="absolute h-full bg-pink-primary opacity-70 rounded-full"
                  style={{
                    left: `${(cycle.start / cycle.total) * 100}%`,
                    width: `${(cycle.period / cycle.total) * 100}%`,
                  }}
                />
                <View
                  className="absolute h-full bg-teal opacity-60 rounded-full"
                  style={{
                    left: `${((cycle.start + cycle.period + 4) / cycle.total) * 100}%`,
                    width: `${(cycle.fertile / cycle.total) * 100}%`,
                  }}
                />
              </View>
            </View>
          ))}

          <View className="flex-row gap-4 mt-2">
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-full bg-pink-primary" />
              <Text className="text-xs font-semibold text-muted">Period</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-full bg-teal" />
              <Text className="text-xs font-semibold text-muted">Fertile</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
