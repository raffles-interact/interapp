import { useEffect } from 'react';
import * as Sentry from '@sentry/react';

type NextJSError = Error & { digest?: string };

/**
 * Custom React hook for capturing errors with Sentry.
 *
 * @param {NextJSError} error - The error to be captured. This is an object that should be an instance of Error, and it can optionally have a `digest` property of type string.
 *
 * @example
 * import useSentryCaptureError from './useSentryCaptureError';
 *
 * function MyComponent() {
 *   const error = // get the error from somewhere
 *
 *   useSentryCaptureError(error);
 *
 *   // rest of the component
 * }
 *
 * @returns {void} This hook does not return a value. It performs a side effect (capturing the error with Sentry) when the `error` parameter changes.
 */
function useSentryCaptureError(error: NextJSError) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
}

export default useSentryCaptureError;
