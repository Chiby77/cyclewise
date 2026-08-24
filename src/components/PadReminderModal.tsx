import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, Switch, ScrollView, Alert } from 'react-native';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import { useTheme } from '@/context/ThemeContext';
import {
  type ProductType,
  type PadReminderConfig,
  getPadReminderConfig,
  savePadReminderConfig,
  PRODUCT_LIMITS,
} from '@/services/padReminderService';

interface Props {
  visible: boolean;
  onClose: () => void;
  isPeriodActive: boolean;
  isHeavyFlow?: boolean;
}

export function PadReminderModal({ visible, onClose, isPeriodActive, isHeavyFlow = false }: Props) {
  const { isDark, themeColors } = useTheme();
  const [config, setConfig] = useState<PadReminderConfig | null>(null);

  useEffect(() => {
    if (visible) {
      getPadReminderConfig().then(setConfig);
    }
  }, [visible]);

  if (!config) return null;

  const handleSelectProduct = (p: ProductType) => {
    let nextInterval = config.intervalHours;

    if (p === 'Tampon' && nextInterval > 8) {
      nextInterval = 8;
    }
    setConfig({
      ...config,
      productType: p,
      intervalHours: nextInterval || PRODUCT_LIMITS[p].default,
    });
  };

  const handleAdjustInterval = (delta: number) => {
    const limits = PRODUCT_LIMITS[config.productType];
    const nextVal = config.intervalHours + delta;
    if (nextVal < limits.min || nextVal > limits.max) return;

    if (config.productType === 'Tampon' && nextVal > 8) {
      Alert.alert('Safety Limit', 'Tampons must not be worn longer than 8 hours due to TSS risks.');
      return;
    }

    setConfig({ ...config, intervalHours: nextVal });
  };

  const handleSave = async () => {
    await savePadReminderConfig(config, isPeriodActive, isHeavyFlow);
    onClose();
  };

  const limits = PRODUCT_LIMITS[config.productType];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-card dark:bg-dark-card rounded-t-3xl p-6 border-t border-gray-100 dark:border-dark-border max-h-[90%]">
          <View className="flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-border">
            <View className="flex-row items-center gap-2">
              <Icon name={ICONS.notifications} size={22} color={colors.pinkPrimary} />
              <Text className="text-lg font-extrabold text-text dark:text-dark-text">Product Reminders</Text>
            </View>
            <Pressable onPress={onClose} className="p-1 active:opacity-70">
              <Icon name={ICONS.back} size={20} color={isDark ? themeColors.text : colors.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="py-4">

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-dark-border">
              <View>
                <Text className="text-sm font-bold text-text dark:text-dark-text">Change Reminders</Text>
                <Text className="text-xs text-muted dark:text-dark-muted font-semibold">
                  Only active during your logged period
                </Text>
              </View>
              <Switch
                value={config.enabled}
                onValueChange={(val) => setConfig({ ...config, enabled: val })}
                trackColor={{ false: '#D1D5DB', true: colors.pinkPrimary }}
              />
            </View>

            <Text className="text-xs font-extrabold text-muted dark:text-dark-muted tracking-wider uppercase mt-4 mb-2">
              Select Product Type
            </Text>
            <View className="flex-row gap-2 mb-2">
              {(['Pad', 'Tampon', 'Cup'] as ProductType[]).map((p) => {
                const isSelected = config.productType === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => handleSelectProduct(p)}
                    className={`flex-1 py-3 rounded-2xl items-center border ${
                      isSelected
                        ? 'border-pink-primary bg-pink-light dark:bg-dark-card-hover'
                        : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card'
                    } active:opacity-80`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        isSelected ? 'text-pink-primary' : 'text-text dark:text-dark-text'
                      }`}
                    >
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="text-xs text-muted dark:text-dark-muted font-semibold mb-4">
              {limits.desc}
            </Text>

            <View className="bg-bg dark:bg-dark-bg p-4 rounded-2xl mb-4 border border-gray-100 dark:border-dark-border">
              <Text className="text-xs font-bold text-muted dark:text-dark-muted uppercase mb-1">
                Reminder Interval
              </Text>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-2xl font-black text-text dark:text-dark-text">
                  Every {config.intervalHours} hour{config.intervalHours > 1 ? 's' : ''}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={() => handleAdjustInterval(-1)}
                    disabled={config.intervalHours <= limits.min}
                    className="w-10 h-10 rounded-full bg-card dark:bg-dark-card border border-gray-200 dark:border-dark-border items-center justify-center active:opacity-70"
                  >
                    <Text className="text-lg font-extrabold text-text dark:text-dark-text">−</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleAdjustInterval(1)}
                    disabled={config.intervalHours >= limits.max}
                    className="w-10 h-10 rounded-full bg-card dark:bg-dark-card border border-gray-200 dark:border-dark-border items-center justify-center active:opacity-70"
                  >
                    <Text className="text-lg font-extrabold text-text dark:text-dark-text">+</Text>
                  </Pressable>
                </View>
              </View>

              {config.productType === 'Tampon' && (
                <View className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                  <Text className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    🛡️ TSS Safety Limit: Tampons cannot be set beyond 8 hours.
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-dark-border">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-bold text-text dark:text-dark-text">Adjust on Heavy Flow Days</Text>
                <Text className="text-xs text-muted dark:text-dark-muted font-semibold">
                  Reminds 1 hour earlier on heavy flow logs
                </Text>
              </View>
              <Switch
                value={config.scaleForHeavyFlow}
                onValueChange={(val) => setConfig({ ...config, scaleForHeavyFlow: val })}
                trackColor={{ false: '#D1D5DB', true: colors.pinkPrimary }}
              />
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-dark-border">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-bold text-text dark:text-dark-text">Quiet Hours (10 PM – 7 AM)</Text>
                <Text className="text-xs text-muted dark:text-dark-muted font-semibold">
                  Silences routine alerts (Tampon 8h limit is never silenced)
                </Text>
              </View>
              <Switch
                value={config.quietHoursEnabled}
                onValueChange={(val) => setConfig({ ...config, quietHoursEnabled: val })}
                trackColor={{ false: '#D1D5DB', true: colors.pinkPrimary }}
              />
            </View>
          </ScrollView>

          <Pressable
            onPress={handleSave}
            className="w-full py-4 rounded-full bg-pink-primary items-center shadow-md mt-2 active:opacity-90"
          >
            <Text className="text-white text-base font-bold">Save Settings</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
