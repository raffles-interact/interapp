import { Router } from 'express';
import { validateRequiredFields, verifyJWT, verifyRequiredPermission } from '../middleware';
import { UserModel } from '@models/user';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { Permissions } from '@utils/permissions';

const userRouter = Router();

userRouter.get('/', validateRequiredFields([], ['username']), verifyJWT, async (req, res) => {
  const username = req.query.username as string | undefined;

  if (username !== undefined) {
    const user = await UserModel.getUserDetails(username);
    res.status(200).send(user);
    return;
  }

  const requesterUsername = req.headers.username as string;
  const requesterPerms = await UserModel.checkPermissions(requesterUsername);

  // need 1 of these permissions to get all users
  const neededPerms = [Permissions.ADMIN, Permissions.EXCO, Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC];

  if (!requesterPerms.some((perm) => neededPerms.includes(perm))) {
    throw new HTTPError(
      'Insufficient permissions',
      'Only admins can get all users',
      HTTPErrorCode.UNAUTHORIZED_ERROR,
    );
  }

  const users = await UserModel.getUserDetails();
  res.status(200).send(users);
});

userRouter.delete(
  '/',
  validateRequiredFields(['username']),
  verifyJWT,
  verifyRequiredPermission(Permissions.ADMIN),
  async (req, res) => {
    await UserModel.deleteUser(req.body.username as string);
    res.status(204).send();
  },
);

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
  validateRequiredFields(['new_email'], ['username']),
  verifyJWT,
  async (req, res) => {
    if (req.body.username) {
      // we are changing someone else's email
      const perms = await UserModel.checkPermissions(req.headers.username as string);
      if (!perms.includes(Permissions.ADMIN)) {
        throw new HTTPError(
          'Insufficient permissions',
          "Only admins can change other users' emails",
          HTTPErrorCode.UNAUTHORIZED_ERROR,
        );
      }
    }
    const username = req.body.username ?? req.headers.username;
    const emailRegex = new RegExp(process.env.SCHOOL_EMAIL_REGEX as string);
    if (emailRegex.test(req.body.new_email)) {
      throw new HTTPError(
        'Invalid email',
        'Email cannot be a valid school email',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    await UserModel.changeEmail(username, req.body.new_email);
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
  verifyRequiredPermission(Permissions.ADMIN),
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
  '/permissions',
  validateRequiredFields([], ['username']),
  verifyJWT,
  verifyRequiredPermission(Permissions.ADMIN),
  async (req, res) => {
    const username = req.query.username as string | undefined;
    const permissions = await UserModel.getPermissions(username);
    res.status(200).send(permissions);
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
  verifyRequiredPermission(Permissions.EXCO),
  validateRequiredFields(['username', 'service_id']),
  async (req, res) => {
    await UserModel.addServiceUser(req.body.service_id, req.body.username);
    res.status(204).send();
  },
);

userRouter.delete(
  '/userservices',
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  validateRequiredFields(['username', 'service_id']),
  async (req, res) => {
    await UserModel.removeServiceUser(req.body.service_id, req.body.username);
    res.status(204).send();
  },
);

userRouter.patch(
  '/userservices',
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  validateRequiredFields(['service_id', 'data']),
  async (req, res) => {
    //validate data to be of shape {action: 'add' | 'remove', username: string}[]
    if (
      !Array.isArray(req.body.data) ||
      !req.body.data.every((x: any) => x.action === 'add' || x.action === 'remove') ||
      req.body.data.length === 0
    ) {
      throw new HTTPError(
        'Invalid field type',
        "Data must be an array of objects with action: 'add' | 'remove' and username",
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

    await UserModel.updateServiceUserBulk(req.body.service_id, req.body.data);
    res.status(204).send();
  },
);

userRouter.patch(
  '/service_hours',
  verifyJWT,
  validateRequiredFields(['username', 'hours']),
  async (req, res) => {
    await UserModel.updateServiceHours(req.body.username, req.body.hours);
    res.status(204).send();
  },
);
export default userRouter;
