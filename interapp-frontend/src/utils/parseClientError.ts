interface ClientErrorParams {
  message: string;
  responseBody?: unknown;
  responseStatus?: number;
}

export class ClientError extends Error {
  constructor({ message, responseBody, responseStatus }: ClientErrorParams) {
    const cause = ClientError.formatCause({ responseBody, responseStatus });
    super(message, { cause });
  }

  static formatCause({
    responseBody,
    responseStatus,
  }: Pick<ClientErrorParams, 'responseBody' | 'responseStatus'>): string {
    if (!responseStatus && !responseBody) return '';
    return `
    \n
      Response status: ${responseStatus}\n
      Response body: ${String(responseBody)}
    `;
  }
}
