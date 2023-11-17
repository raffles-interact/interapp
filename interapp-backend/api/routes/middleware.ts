import { Request, Response, NextFunction } from 'express';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { AuthModel, UserJWT } from '@models/auth';

export function validateRequiredFields(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = requiredFields.filter((field) => !req.body[field]);
    if (missing.length > 0) {
      throw new HTTPError(
        'Missing fields',
        `You are missing these field(s): ${missing.join(', ')}`,
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    next();
  };
}

export async function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new HTTPError(
      'Missing JWT',
      'You must provide a JWT token in the Authorization header',
      HTTPErrorCode.FORBIDDEN_ERROR,
    );
  }
  req.body.user = await AuthModel.verify(token);
  next();
}

export function verifyRequiredRole(role: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.user) {
      throw new HTTPError(
        'Missing request.body.user',
        'You must set req.body.user to the JWT payload',
        HTTPErrorCode.FORBIDDEN_ERROR,
      );
    }

    const jwt = req.body.user.payload as UserJWT;

    if (!jwt.permissions.includes(role)) {
      throw new HTTPError(
        'Insufficient permissions',
        'You do not have sufficient permissions to access this resource. Required role: ' +
          role.toString(),
        HTTPErrorCode.FORBIDDEN_ERROR,
      );
    }
    next();
  };
}

export function handleError(err: HTTPError, req: Request, res: Response, next: NextFunction) {
  res.status(err.status);
  res.header(err.headers);
  res.json({
    name: err.name,
    message: err.message,
    data: err.data,
  });

  next(err);
}
