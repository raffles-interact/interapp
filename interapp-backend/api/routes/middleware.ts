import { Request, Response, NextFunction } from 'express';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { AuthModel } from '@models/auth';
import { UserModel } from '@models/user';

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
  const { userId, username } = (await AuthModel.verify(token, 'access')).payload;
  req.headers.userId = String(userId);
  req.headers.username = username;
  next();
}

// must be used after verifyJWT to get the userId and username
export function verifyRequiredRole(role: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const username = req.headers.username;

    if (!username || typeof username !== 'string') {
      throw new HTTPError(
        'Missing username',
        'Must call verifyJWT before calling verifyRequiredRole',
        HTTPErrorCode.INTERNAL_SERVER_ERROR,
      );
    }

    const perms = await UserModel.checkRoles(username);

    if (!perms.includes(role)) {
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
