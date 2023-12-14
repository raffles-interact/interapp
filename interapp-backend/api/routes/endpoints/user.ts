import { Router } from 'express';
import { validateRequiredFields, verifyJWT, verifyRequiredRole } from '../middleware';
import { UserModel } from '@models/user';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { Permissions } from '@utils/permissions';

const userRouter = Router();

userRouter.patch(
  '/password/change',
  validateRequiredFields(['old_password', 'new_password']),
  verifyJWT,
  async (req, res) => {
    await UserModel.changePassword(
      req.headers.username as string,
      req.body.old_password,
      req.body.new_password,
    );
    res.status(204).send();
  },
);

userRouter.post('/password/reset_email', validateRequiredFields(['username']), async (req, res) => {
  await UserModel.sendResetPasswordEmail(req.body.username);
  res.status(204).send();
});

userRouter.patch('/password/reset', validateRequiredFields(['token']), async (req, res) => {
  const newPw = await UserModel.resetPassword(req.body.token);
  res.clearCookie('refresh', { path: '/api/auth/refresh' });
  res.status(200).send({
    temp_password: newPw,
  });
});

userRouter.patch(
  '/change_email',
  validateRequiredFields(['new_email']),
  verifyJWT,
  async (req, res) => {
    const emailRegex = new RegExp(process.env.SCHOOL_EMAIL_REGEX as string);
    if (emailRegex.test(req.body.new_email)) {
      throw new HTTPError(
        'Invalid email',
        'Email cannot be a valid school email',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    await UserModel.changeEmail(req.headers.username as string, req.body.new_email);
    res.status(204).send();
  },
);

userRouter.post(
  '/verify_email',
  validateRequiredFields(['username']),
  verifyJWT,
  async (req, res) => {
    await UserModel.sendVerifyEmail(req.body.username);
    res.status(204).send();
  },
);

userRouter.patch('/verify', validateRequiredFields(['token']), verifyJWT, async (req, res) => {
  await UserModel.verifyEmail(req.body.token);
  res.status(204).send();
});

userRouter.patch(
  '/permissions',
  validateRequiredFields(['username', 'permissions']),
  verifyJWT,
  verifyRequiredRole(Permissions.ADMIN),
  async (req, res) => {
    if (
      !Array.isArray(req.body.permissions) ||
      !req.body.permissions.every((x: any) => x in Permissions) ||
      req.body.permissions.length === 0
    ) {
      throw new HTTPError(
        'Invalid field type',
        'Permissions must be an array of permission IDs',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    if (!req.body.permissions.includes(Permissions.VISTOR)) {
      throw new HTTPError(
        'Invalid field type',
        'Permissions must include the visitor permission',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    await UserModel.updatePermissions(req.body.username, req.body.permissions);
    res.status(204).send();
  },
);

userRouter.get(
  '/userservices',
  verifyJWT,
  validateRequiredFields(['username']),
  async (req, res) => {
    const services = await UserModel.getAllServicesByUser(req.query.username as string);
    res.status(200).send(services);
  },
);

userRouter.post(
  '/userservices',
  verifyJWT,
  verifyRequiredRole(Permissions.EXCO),
  validateRequiredFields(['username', 'service_id']),
  async (req, res) => {
    await UserModel.addServiceUser(req.body.service_id, req.body.username);
    res.status(204).send();
  },
);

userRouter.delete(
  '/userservices',
  verifyJWT,
  verifyRequiredRole(Permissions.EXCO),
  validateRequiredFields(['username', 'service_id']),
  async (req, res) => {
    await UserModel.removeServiceUser(req.body.service_id, req.body.username);
    res.status(204).send();
  },
);
export default userRouter;
