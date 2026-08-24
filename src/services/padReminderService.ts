import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from './notifications';

export type ProductType = 'Pad' | 'Tampon' | 'Cup';

export interface PadReminderConfig {
  enabled: boolean;
  productType: ProductType;
  intervalHours: number; // Pad: 1-8h (default 4), Tampon: 1-8h (default 4, MAX 8), Cup: 1-12h (default 8)
  scaleForHeavyFlow: boolean;
  quietHoursEnabled: boolean;
  quietStartHour: number; // e.g. 22 (10 PM)
  quietEndHour: number; // e.g. 7 (7 AM)
  lastChangedTimestamp: number | null; // epoch ms
}

const STORAGE_KEY = '@cyclewise_pad_reminder_config';
const NOTIFICATION_ID_ROUTINE = 'cyclewise-pad-routine';
const NOTIFICATION_ID_SAFETY = 'cyclewise-tampon-safety';

export const DEFAULT_CONFIG: PadReminderConfig = {
  enabled: true,
  productType: 'Pad',
  intervalHours: 4,
  scaleForHeavyFlow: true,
  quietHoursEnabled: true,
  quietStartHour: 22,
  quietEndHour: 7,
  lastChangedTimestamp: null,
};

export const PRODUCT_LIMITS: Record<ProductType, { default: number; min: number; max: number; desc: string }> = {
  Pad: { default: 4, min: 1, max: 8, desc: 'Change every 3–4 hours for freshness & hygiene.' },
  Tampon: { default: 4, min: 1, max: 8, desc: 'Max 8-hour limit to prevent Toxic Shock Syndrome (TSS).' },
  Cup: { default: 8, min: 2, max: 12, desc: 'Can be worn up to 12 hours depending on flow.' },
};

/**
 * Loads the user's pad/tampon reminder configuration.
 */
export async function getPadReminderConfig(): Promise<PadReminderConfig> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      // Enforce Tampon 8-hour safety ceiling
      intervalHours:
        parsed.productType === 'Tampon'
          ? Math.min(parsed.intervalHours || 4, 8)
          : parsed.intervalHours || 4,
    };
  } catch (error) {
    console.warn('[PadReminder] Failed to load config:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Saves the reminder configuration and reschedules notifications.
 */
export async function savePadReminderConfig(
  config: Partial<PadReminderConfig>,
  isPeriodActive: boolean,
  isHeavyFlow: boolean = false
): Promise<PadReminderConfig> {
  const current = await getPadReminderConfig();
  const next: PadReminderConfig = {
    ...current,
    ...config,
  };

  // Hard safety ceiling check for tampons
  if (next.productType === 'Tampon' && next.intervalHours > 8) {
    next.intervalHours = 8;
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  if (next.enabled && isPeriodActive) {
    await scheduleNextChangeReminder(next, isHeavyFlow);
  } else {
    await cancelPadReminders();
  }

  return next;
}

/**
 * Cancels all scheduled pad/tampon notifications.
 */
export async function cancelPadReminders(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID_ROUTINE).catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID_SAFETY).catch(() => {});
  } catch (err) {
    console.warn('[PadReminder] Error cancelling notifications:', err);
  }
}

/**
 * Checks if a given Date falls within quiet hours.
 */
function isDuringQuietHours(date: Date, startHour: number, endHour: number): boolean {
  const hour = date.getHours();
  if (startHour > endHour) {
    // Overnight e.g. 22:00 to 07:00
    return hour >= startHour || hour < endHour;
  }
  return hour >= startHour && hour < endHour;
}

/**
 * Schedules the next change reminder based on last changed time.
 */
export async function scheduleNextChangeReminder(
  config: PadReminderConfig,
  isHeavyFlow: boolean = false
): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await cancelPadReminders();

    const lastTime = config.lastChangedTimestamp || Date.now();
    let effectiveIntervalHours = config.intervalHours;

    // Auto-scale down on heavy flow days (e.g. 1 hour earlier, min 1h)
    if (config.scaleForHeavyFlow && isHeavyFlow && effectiveIntervalHours > 1) {
      effectiveIntervalHours = Math.max(1, effectiveIntervalHours - 1);
    }

    const nextFireDate = new Date(lastTime + effectiveIntervalHours * 60 * 60 * 1000);
    const now = new Date();

    if (nextFireDate > now) {
      // Check quiet hours
      const inQuietHours =
        config.quietHoursEnabled &&
        isDuringQuietHours(nextFireDate, config.quietStartHour, config.quietEndHour);

      if (!inQuietHours) {
        await Notifications.scheduleNotificationAsync({
          identifier: NOTIFICATION_ID_ROUTINE,
          content: {
            title: `Time to Change Your ${config.productType} 🌸`,
            body: `It's been ${effectiveIntervalHours} hours since your last change — time to switch for fresh protection.`,
            sound: true,
            data: { type: 'pad_reminder', product: config.productType },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: nextFireDate,
          },
        });
      }
    }

    // TAMPON SAFETY CEILING NOTIFICATION (Strict 8-Hour TSS Rule)
    // Never suppressed by quiet hours!
    if (config.productType === 'Tampon') {
      const safetyFireDate = new Date(lastTime + 8 * 60 * 60 * 1000);
      if (safetyFireDate > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: NOTIFICATION_ID_SAFETY,
          content: {
            title: '⚠️ Tampon Safety Limit: 8 Hours Reached',
            body: 'Tampons should not be worn longer than 8 hours to avoid Toxic Shock Syndrome (TSS). Please change now.',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            data: { type: 'tampon_safety_limit' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: safetyFireDate,
          },
        });
      }
    }
  } catch (error) {
    console.warn('[PadReminder] Failed to schedule change reminder:', error);
  }
}

/**
 * Logs a product change right now and reschedules the next reminder immediately.
 */
export async function logProductChange(
  productType?: ProductType,
  isPeriodActive: boolean = true,
  isHeavyFlow: boolean = false
): Promise<PadReminderConfig> {
  const current = await getPadReminderConfig();
  const updated: PadReminderConfig = {
    ...current,
    productType: productType || current.productType,
    lastChangedTimestamp: Date.now(),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  if (updated.enabled && isPeriodActive) {
    await scheduleNextChangeReminder(updated, isHeavyFlow);
  }

  return updated;
}
