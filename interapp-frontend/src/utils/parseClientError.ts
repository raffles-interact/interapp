interface ClientErrorParams {
  message: string;
  responseBody?: unknown;
  responseStatus?: number;
}

export class ClientError extends Error {
  constructor({ message, responseBody, responseStatus }: ClientErrorParams) {
    const cause = ClientError.formatCause({ responseBody, responseStatus });
    super(message + '\n' + cause, { cause });
  }

  static formatCause({
    responseBody,
    responseStatus,
  }: Pick<ClientErrorParams, 'responseBody' | 'responseStatus'>): string {
    if (!responseStatus && !responseBody) return '';

    return `Response status: ${responseStatus}\nResponse body: \n${JSON.stringify(
      responseBody,
      null,
      2,
    )}`;
  }
}
