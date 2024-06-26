import * as Sentry from '@sentry/nextjs';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

Sentry.init({
  enabled: process.env.NODE_ENV === 'production',
  release: process.env.NEXT_PUBLIC_VERSION ? process.env.NEXT_PUBLIC_VERSION : undefined,
  // dsn can be public, no security risk here
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
