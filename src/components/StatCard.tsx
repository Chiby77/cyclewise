import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput } from 'react-native';
import { Icon, type IconName } from './Icon';
import { colors } from '@/theme/colors';

type Props = {
  label: string;
  value: string | number;
  unit: string;
  icon: IconName;
  onSave?: (newValue: number) => void;
  minRange?: number;
  maxRange?: number;
};

export function StatCard({ label, value, unit, icon, onSave, minRange, maxRange }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState(value !== null && value !== undefined ? String(value) : '');
  const [error, setError] = useState<string | null>(null);

  const handlePress = () => {
    if (onSave) {
      setInputValue(value !== null && value !== undefined && value !== '--' ? String(value) : '');
      setError(null);
      setModalVisible(true);
    }
  };

  const handleSave = () => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setError(`Enter a valid ${label.toLowerCase()}.`);
      return;
    }

    if (minRange !== undefined && num < minRange) {
      setError(`Enter a ${label.toLowerCase()} of at least ${minRange} ${unit}.`);
      return;
    }

    if (maxRange !== undefined && num > maxRange) {
      setError(`Enter a ${label.toLowerCase()} of at most ${maxRange} ${unit}.`);
      return;
    }

    setError(null);
    onSave?.(num);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        className="bg-card dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-3 items-center gap-1 shadow-sm flex-1 active:opacity-80"
      >
        <Text className="text-xs font-bold text-text dark:text-dark-text">{label}</Text>
        <Icon name={icon} size={22} color={colors.pinkPrimary} />
        <Text className="text-xs font-semibold text-text dark:text-dark-text">
          {value ?? '--'} <Text className="text-muted dark:text-dark-muted">{unit}</Text>
        </Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-card dark:bg-dark-card w-full max-w-sm rounded-3xl p-5 shadow-xl border border-gray-100 dark:border-dark-border gap-4">
            <View className="flex-row items-center gap-2">
              <Icon name={icon} size={24} color={colors.pinkPrimary} />
              <Text className="text-lg font-bold text-text dark:text-dark-text">Update {label}</Text>
            </View>

            <View className="gap-1">
              <Text className="text-xs text-muted dark:text-dark-muted">
                Enter your {label.toLowerCase()} in {unit}:
              </Text>
              <View className="flex-row items-center border border-gray-300 dark:border-dark-border rounded-xl px-3 py-2 bg-gray-50 dark:bg-dark-card-hover">
                <TextInput
                  value={inputValue}
                  onChangeText={(text) => {
                    setInputValue(text);
                    if (error) setError(null);
                  }}
                  keyboardType="decimal-pad"
                  placeholder={`e.g. ${minRange ?? 1}`}
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-base text-text dark:text-dark-text font-bold"
                  autoFocus
                />
                <Text className="text-sm font-semibold text-muted dark:text-dark-muted ml-2">{unit}</Text>
              </View>
              {error && <Text className="text-xs text-pink-dark mt-1 font-semibold">{error}</Text>}
            </View>

            <View className="flex-row gap-3 mt-2">
              <Pressable
                onPress={() => setModalVisible(false)}
                className="flex-1 py-3 rounded-xl bg-gray-200 dark:bg-dark-card-hover items-center active:opacity-80"
              >
                <Text className="font-bold text-text dark:text-dark-text">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="flex-1 py-3 rounded-xl bg-pink-primary items-center active:opacity-80 shadow-sm"
              >
                <Text className="font-bold text-white">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
