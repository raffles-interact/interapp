interface ZodFieldErrors {
  fieldErrors: {
    [key: string]: Array<string>;
  };
}
export function parseServerError(resBody: unknown) {
  // check if 'data' exists in the response body
  if (!resBody || typeof resBody !== 'object' || !('data' in resBody)) {
    return 'An unknown error occurred';
  }

  const { data: errors } = resBody;

  if (typeof errors === 'string') {
    return errors;
  }

  if (!errors || typeof errors !== 'object' || !('fieldErrors' in errors)) {
    return 'An unknown error occurred';
  }
  const errorMessages = Object.entries((errors as ZodFieldErrors).fieldErrors)
    .map(([field, messages]) => {
      return messages.map((message) => `${field}: ${message}`);
    })
    .flat();
  return errorMessages.join('\n');
}
