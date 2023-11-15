export interface AppError extends Error {
  name: string;
  message: string;
  data?: Record<string, any>;
}

export class HTTPError extends Error implements Partial<AppError> {
  name: string;
  message: string;
  data?: Record<string, any>;
  status: HTTPErrorCode;
  headers?: Record<string, string>;

  constructor(
    name: string,
    message: string,
    status: HTTPErrorCode,
    headers?: Record<string, string>,
    data?: Record<string, any>,
  ) {
    super(message);
    this.name = name;
    this.message = message;
    this.data = data;
    this.status = status;
    this.headers = headers;
  }
}

export class DatabaseError extends Error implements Partial<AppError> {
  name: string;
  message: string;
  data?: Record<string, any>;
  query: string;
  parameters?: any[];

  constructor(
    name: string,
    message: string,
    query: string,
    parameters?: any[],
    data?: Record<string, any>,
  ) {
    super(message);
    this.name = name;
    this.message = message;
    this.data = data;
    this.query = query;
    this.parameters = parameters;
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
