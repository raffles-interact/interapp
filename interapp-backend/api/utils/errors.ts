export interface AppError extends Error {
  name: string;
  message: string;
  data?: Record<string, any> | Array<unknown>;
}

export class HTTPError extends Error implements AppError {
  public readonly name: string;
  public readonly message: string;
  public readonly data?: Record<string, any> | Array<unknown>;
  public readonly status: HTTPErrorCode;
  public readonly headers?: Record<string, string>;

  constructor(
    name: string,
    message: string,
    status: HTTPErrorCode,
    data?: Record<string, any> | Array<unknown>,
    headers?: Record<string, string>,
  ) {
    super(message);
    this.name = name;
    this.message = message;
    this.data = data;
    this.status = status;
    this.headers = headers;
  }
}

export class TestError extends Error implements AppError {
  public readonly name: string;
  public readonly message: string;
  public readonly data?: Record<string, any> | Array<unknown>;

  constructor(name: string, message: string, data?: Record<string, any> | Array<unknown>) {
    super(message);
    this.name = name;
    this.message = message;
    this.data = data;
  }
}

// modify as needed to suit API needs as it arises
export enum HTTPErrorCode {
  BAD_REQUEST_ERROR = 400,
  UNAUTHORIZED_ERROR = 401,
  FORBIDDEN_ERROR = 403,
  NOT_FOUND_ERROR = 404,
  METHOD_NOT_ALLOWED_ERROR = 405,
  CONFLICT_ERROR = 409,
  IM_A_TEAPOT_ERROR = 418, // lol
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED_ERROR = 501,
}

export const TestErrors = {
  NO_ACCESS_TOKEN: new TestError('NoAccessToken', 'No access token found'),
  USER_NOT_FOUND: new TestError('UserNotFound', 'User not found'),
};
