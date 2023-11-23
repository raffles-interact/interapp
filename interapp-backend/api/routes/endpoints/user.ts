import { Router } from 'express';
import { validateRequiredFields, verifyJWT } from '../middleware';
import { UserModel } from '@models/user';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { Permissions } from '@utils/permissions';

const userRouter = Router();

userRouter.patch(
  '/password/change',
  validateRequiredFields(['oldPassword', 'newPassword']),
  verifyJWT,
  async (req, res) => {
    await UserModel.changePassword(
      req.headers.username as string,
      req.body.oldPassword,
      req.body.newPassword,
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
    tempPassword: newPw,
  });
});

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
  '/permissions/update',
  validateRequiredFields(['username', 'permissions']),
  verifyJWT,
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

export default userRouter;
