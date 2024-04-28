export interface AppError extends Error {
  name: string;
  message: string;
  data?: Record<string, unknown> | Array<unknown>;
}

export class HTTPError extends Error implements AppError {
  public readonly name: string;
  public readonly message: string;
  public readonly data?: Record<string, unknown> | Array<unknown>;
  public readonly status: HTTPErrorCode;
  public readonly headers?: Record<string, string>;

  constructor(
    name: string,
    message: string,
    status: HTTPErrorCode,
    data?: Record<string, unknown> | Array<unknown>,
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
  public readonly data?: Record<string, unknown> | Array<unknown>;

  constructor(name: string, message: string, data?: Record<string, unknown> | Array<unknown>) {
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

export const HTTPErrors = {
  INVALID_DATA_URL: new HTTPError(
    'InvalidDataUrl',
    'Image is not a valid data URL',
    HTTPErrorCode.BAD_REQUEST_ERROR,
  ),
  ALREADY_EXISTS: new HTTPError(
    'AlreadyExists',
    'Resource already exists',
    HTTPErrorCode.CONFLICT_ERROR,
  ),
  RESOURCE_NOT_FOUND: new HTTPError(
    'ResourceNotFound',
    'Resource not found',
    HTTPErrorCode.NOT_FOUND_ERROR,
  ),
  FAILED_HASHING_PASSWORD: new HTTPError(
    'FailedHashingPassword',
    'An error occurred while hashing the password',
    HTTPErrorCode.INTERNAL_SERVER_ERROR,
  ),
  INVALID_PASSWORD: new HTTPError(
    'InvalidPassword',
    'The password you entered is incorrect',
    HTTPErrorCode.UNAUTHORIZED_ERROR,
  ),
  INVALID_REFRESH_TOKEN: new HTTPError(
    'InvalidRefreshToken',
    'The refresh token is invalid',
    HTTPErrorCode.UNAUTHORIZED_ERROR,
  ),
  INVALID_ACCESS_TOKEN: new HTTPError(
    'InvalidAccessToken',
    'The access token is invalid',
    HTTPErrorCode.UNAUTHORIZED_ERROR,
  ),
  INVALID_HASH: new HTTPError(
    'InvalidHash',
    'The hash is invalid',
    HTTPErrorCode.BAD_REQUEST_ERROR,
  ),
  INVALID_TIME_INTERVAL: new HTTPError(
    'InvalidTimeInterval',
    'The time interval given is not possible',
    HTTPErrorCode.BAD_REQUEST_ERROR,
  ),
  AD_HOC_NOT_ENABLED: new HTTPError(
    'AdHocNotEnabled',
    'Ad hoc mode is not enabled',
    HTTPErrorCode.FORBIDDEN_ERROR,
  ),
  ALREADY_ATTENDED: new HTTPError(
    'AlreadyAttended',
    'You have already attended this event',
    HTTPErrorCode.CONFLICT_ERROR,
  ),
  ALREADY_VERIFIED: new HTTPError(
    'AlreadyVerified',
    'You have already verified your email',
    HTTPErrorCode.CONFLICT_ERROR,
  ),
  ALREADY_PART_OF_SERVICE: new HTTPError(
    'AlreadyPartOfService',
    'You are already part of this service',
    HTTPErrorCode.CONFLICT_ERROR,
  ),
  NO_SERVICES_FOUND: new HTTPError(
    'NoServicesFound',
    'This user is not part of any service',
    HTTPErrorCode.NOT_FOUND_ERROR,
  ),
  NO_SERVICE_SESSION_FOUND: new HTTPError(
    'NoServiceSessionFound',
    'This user is not part of any service session',
    HTTPErrorCode.NOT_FOUND_ERROR,
  ),
  SERVICE_NO_USER_FOUND: new HTTPError(
    'NoUserFound',
    'Service has no users',
    HTTPErrorCode.NOT_FOUND_ERROR,
  ),
  DATABASE_CORRUPTED: new HTTPError(
    'DatabaseCorrupted',
    'The database contains invalid data or is corrupted',
    HTTPErrorCode.INTERNAL_SERVER_ERROR,
  ),
  INSUFFICIENT_PERMISSIONS: new HTTPError(
    'InsufficientPermissions',
    'You do not have sufficient permissions to perform this action',
    HTTPErrorCode.FORBIDDEN_ERROR,
  ),
  GENERALISED_DB_ERROR: (message: unknown) =>
    new HTTPError('GeneralisedDBError', String(message), HTTPErrorCode.INTERNAL_SERVER_ERROR),
};
