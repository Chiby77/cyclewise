import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const WATER_REMINDER_ID = 'cyclewise-water-reminder';
const PERIOD_ALERT_ID = 'cyclewise-period-alert';
const FERTILE_ALERT_ID = 'cyclewise-fertile-alert';

export function setupNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'CycleWise Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F06292',
    }).catch((err) => console.warn('[Notifications] Channel setup error:', err));
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('[Notifications] Permission request error:', error);
    return false;
  }
}

export async function scheduleWaterReminder(): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.cancelScheduledNotificationAsync(WATER_REMINDER_ID).catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: WATER_REMINDER_ID,
      content: {
        title: 'Time to Hydrate! 💧',
        body: 'Stay refreshed and log your water intake today in CycleWise.',
        sound: true,
        data: { type: 'water' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 10,
        minute: 0,
      },
    });
  } catch (error) {
    console.warn('[Notifications] Failed to schedule water reminder:', error);
  }
}

export async function scheduleCycleAlerts(
  nextPeriodDate: Date,
  nextFertileDate: Date
): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.cancelScheduledNotificationAsync(PERIOD_ALERT_ID).catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(FERTILE_ALERT_ID).catch(() => {});

    const now = new Date();

    const periodAlertDate = new Date(nextPeriodDate);
    periodAlertDate.setDate(periodAlertDate.getDate() - 2);
    periodAlertDate.setHours(9, 0, 0, 0);

    if (periodAlertDate > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: PERIOD_ALERT_ID,
        content: {
          title: 'Period Predicted in 2 Days 🌸',
          body: 'Your next cycle is approaching. Track your symptoms to stay prepared!',
          sound: true,
          data: { type: 'period_approaching' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: periodAlertDate,
        },
      });
    }

    const fertileAlertDate = new Date(nextFertileDate);
    fertileAlertDate.setDate(fertileAlertDate.getDate() - 1);
    fertileAlertDate.setHours(9, 0, 0, 0);

    if (fertileAlertDate > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: FERTILE_ALERT_ID,
        content: {
          title: 'Fertile Window Begins Tomorrow ✨',
          body: 'Your high-chance fertility days are about to start.',
          sound: true,
          data: { type: 'fertile_window' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fertileAlertDate,
        },
      });
    }
  } catch (error) {
    console.warn('[Notifications] Failed to schedule cycle alerts:', error);
  }
}
