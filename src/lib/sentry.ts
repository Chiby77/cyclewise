import * as Sentry from '@sentry/react-native';

export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (dsn && !dsn.includes('your-sentry-dsn')) {
    Sentry.init({
      dsn,
      debug: false,
    });
  }
}

export { Sentry };
