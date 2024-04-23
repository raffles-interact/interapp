import { Request, Response, NextFunction } from 'express';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { AuthModel, UserModel } from '@models/.';
import { z } from 'zod';

import rateLimit from 'express-rate-limit';

type ReqBody = Partial<{ [key: string]: ReqBody }> | ReqBody[] | string | number | boolean | null;

type ReqQuery = { [key: string]: string | string[] | undefined };

export function validateRequiredFields<T extends z.ZodType<ReqBody | ReqQuery>>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const content: unknown = req.method === 'GET' ? req.query : req.body;
    const validationResult = schema.safeParse(content);

    if (!validationResult.success) {
      throw new HTTPError(
        'zodError',
        validationResult.error.message,
        HTTPErrorCode.BAD_REQUEST_ERROR,
        validationResult.error.flatten(),
      );
    }
    if (req.method === 'GET') {
      req.query = validationResult.data as ReqQuery;
    } else {
      req.body = validationResult.data as ReqBody;
    }
    next();
  };
}

export async function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPError(
      'Missing JWT',
      'You must provide a JWT token in the Authorization header',
      HTTPErrorCode.UNAUTHORIZED_ERROR,
    );
  }

  const token = authHeader.split(' ')[1];
  const { user_id, username } = (await AuthModel.verify(token, 'access')).payload;

  req.headers.user_id = String(user_id);
  req.headers.username = username;
  next();
}

// must be used after verifyJWT to get the user_id and username
export function verifyRequiredPermission(...required: number[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const username = req.headers.username;

    if (!username || typeof username !== 'string') {
      throw new HTTPError(
        'Missing username',
        'Must call verifyJWT before calling verifyRequiredPermission',
        HTTPErrorCode.INTERNAL_SERVER_ERROR,
      );
    }

    const perms = await UserModel.checkPermissions(username);

    if (!perms.some((perm) => required.includes(perm))) {
      throw new HTTPError(
        'Insufficient permissions',
        'You do not have sufficient permissions to access this resource. Required role: ' +
          required.toString() +
          '. Your roles: ' +
          perms.join(', '),
        HTTPErrorCode.FORBIDDEN_ERROR,
      );
    }
    next();
  };
}

export function handleError(
  err: HTTPError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const handleHTTPError = (err: HTTPError) => {
    res.status(err.status);
    res.header(err.headers);
    res.json({
      name: err.name,
      message: err.message,
      data: err.data,
    });
  };

  if (!(err instanceof HTTPError)) {
    const error = new HTTPError(
      'Internal server error',
      'An internal server error has occurred',
      HTTPErrorCode.INTERNAL_SERVER_ERROR,
      {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    );
    handleHTTPError(error);
  } else handleHTTPError(err);

  next(err);
}

export function generateRateLimit(ms: number, max: number) {
  return rateLimit({
    windowMs: ms,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later',
    statusCode: 429,
    validate: {
      ip: process.env.NODE_ENV === 'production', // only validate IP in production
      xForwardedForHeader: false, // don't validate x-forwarded-for header
    },
  });
}
