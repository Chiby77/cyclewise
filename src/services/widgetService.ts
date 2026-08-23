import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WidgetData = {
  currentCycleDay: number;
  waterIntake: number;
  waterGoal: number;
  lastUpdated: string;
};

const WIDGET_STORAGE_KEY = '@cyclewise_widget_data';
const DEFAULT_WIDGET_DATA: WidgetData = {
  currentCycleDay: 1,
  waterIntake: 800,
  waterGoal: 2000,
  lastUpdated: new Date().toISOString(),
};

const getWidgetExtension = () => {
  if (Platform.OS === 'ios') {
    try {
      return require('react-native-widget-extension');
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Updates the serialized widget dataset for native iOS/Android home screen widgets.
 */
export async function updateWidgetData(
  updates: Partial<Omit<WidgetData, 'lastUpdated'>>
): Promise<WidgetData> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
    const existing: WidgetData = raw ? JSON.parse(raw) : DEFAULT_WIDGET_DATA;

    const merged: WidgetData = {
      ...existing,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    const serialized = JSON.stringify(merged);
    await AsyncStorage.setItem(WIDGET_STORAGE_KEY, serialized);

    // If native live activity or widget extension is active (iOS only), forward update
    if (Platform.OS === 'ios') {
      try {
        const WidgetExtension = getWidgetExtension();
        if (WidgetExtension?.areActivitiesEnabled && WidgetExtension.areActivitiesEnabled()) {
          WidgetExtension.updateActivity(merged);
        }
      } catch {
        // Graceful fallback if native widget bundle is not yet injected
      }
    }

    return merged;
  } catch (error) {
    console.warn('[WidgetService] Failed to update widget data:', error);
    return DEFAULT_WIDGET_DATA;
  }
}

/**
 * Retrieves the current widget dataset.
 */
export async function getWidgetData(): Promise<WidgetData> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_WIDGET_DATA;
  } catch {
    return DEFAULT_WIDGET_DATA;
  }
}
