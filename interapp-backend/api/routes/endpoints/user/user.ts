import { Router } from 'express';
import { validateRequiredFields, verifyJWT, verifyRequiredPermission } from '../../middleware';
import {
  OptionalUsername,
  RequiredUsername,
  ChangePasswordFields,
  ChangeEmailFields,
  TokenFields,
  PermissionsFields,
  ServiceIdFieldsNumeric,
  ServiceHoursFields,
  UpdateUserServicesFields,
  ProfilePictureFields,
  ServiceHoursBulkFields,
} from './validation';
import { z } from 'zod';
import { UserModel } from '@models/.';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { Permissions } from '@utils/permissions';

const userRouter = Router();

userRouter.get('/', validateRequiredFields(OptionalUsername), verifyJWT, async (req, res) => {
  const query: z.infer<typeof OptionalUsername> = req.query;
  const username = query.username;

  if (username !== undefined) {
    const user = await UserModel.getUserDetails(username);
    res.status(200).send(user);
    return;
  }

  const requesterUsername = req.headers.username as string;
  const requesterPerms = await UserModel.checkPermissions(requesterUsername);

  // need 1 of these permissions to get all users
  const neededPerms = [
    Permissions.ADMIN,
    Permissions.EXCO,
    Permissions.SERVICE_IC,
    Permissions.MENTORSHIP_IC,
  ];

  if (!requesterPerms.some((perm) => neededPerms.includes(perm))) {
    throw new HTTPError(
      'Insufficient permissions',
      'Only admins, exco, service ic or mentorship ic can get all users',
      HTTPErrorCode.UNAUTHORIZED_ERROR,
    );
  }

  const users = await UserModel.getUserDetails();
  res.status(200).send(users);
});

userRouter.delete(
  '/',
  validateRequiredFields(RequiredUsername),
  verifyJWT,
  verifyRequiredPermission(Permissions.ADMIN),
  async (req, res) => {
    const body: z.infer<typeof RequiredUsername> = req.body;
    await UserModel.deleteUser(body.username as string);
    res.status(204).send();
  },
);

userRouter.patch(
  '/password/change',
  validateRequiredFields(ChangePasswordFields),
  verifyJWT,
  async (req, res) => {
    const body: z.infer<typeof ChangePasswordFields> = req.body;
    await UserModel.changePassword(
      req.headers.username as string,
      body.old_password,
      body.new_password,
    );
    res.status(204).send();
  },
);

userRouter.post(
  '/password/reset_email',
  validateRequiredFields(RequiredUsername),
  async (req, res) => {
    const body: z.infer<typeof RequiredUsername> = req.body;
    await UserModel.sendResetPasswordEmail(body.username);
    res.status(204).send();
  },
);

userRouter.patch('/password/reset', validateRequiredFields(TokenFields), async (req, res) => {
  const body: z.infer<typeof TokenFields> = req.body;
  const newPw = await UserModel.resetPassword(body.token);
  res.clearCookie('refresh', { path: '/api/auth/refresh' });
  res.status(200).send({
    temp_password: newPw,
  });
});

userRouter.patch(
  '/change_email',
  validateRequiredFields(ChangeEmailFields),
  verifyJWT,
  async (req, res) => {
    const body: z.infer<typeof ChangeEmailFields> = req.body;

    if (body.username) {
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
    const username = body.username ?? (req.headers.username as string);

    await UserModel.changeEmail(username, req.body.new_email);
    res.status(204).send();
  },
);

userRouter.post('/verify_email', verifyJWT, async (req, res) => {
  await UserModel.sendVerifyEmail(req.headers.username as string);
  res.status(204).send();
});

userRouter.patch('/verify', validateRequiredFields(TokenFields), verifyJWT, async (req, res) => {
  const body: z.infer<typeof TokenFields> = req.body;
  await UserModel.verifyEmail(body.token);
  res.status(204).send();
});

userRouter.patch(
  '/permissions',
  validateRequiredFields(PermissionsFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.ADMIN),
  async (req, res) => {
    const body: z.infer<typeof PermissionsFields> = req.body;

    await UserModel.updatePermissions(body.username, body.permissions);
    res.status(204).send();
  },
);

userRouter.get(
  '/permissions',
  validateRequiredFields(OptionalUsername),
  verifyJWT,
  async (req, res) => {
    const query: z.infer<typeof OptionalUsername> = req.query;
    const username = query.username;
    const permissions = await UserModel.getPermissions(username);
    res.status(200).send(permissions);
  },
);

userRouter.get(
  '/userservices',
  verifyJWT,
  validateRequiredFields(RequiredUsername),
  async (req, res) => {
    const query = req.query as unknown as z.infer<typeof RequiredUsername>;
    const services = await UserModel.getAllServicesByUser(query.username as string);
    res.status(200).send(services);
  },
);

userRouter.post(
  '/userservices',
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  validateRequiredFields(ServiceIdFieldsNumeric),
  async (req, res) => {
    const body: z.infer<typeof ServiceIdFieldsNumeric> = req.body;
    await UserModel.addServiceUser(body.service_id, body.username);
    res.status(204).send();
  },
);

userRouter.delete(
  '/userservices',
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  validateRequiredFields(ServiceIdFieldsNumeric),
  async (req, res) => {
    const body: z.infer<typeof ServiceIdFieldsNumeric> = req.body;
    await UserModel.removeServiceUser(body.service_id, body.username);
    res.status(204).send();
  },
);

userRouter.patch(
  '/userservices',
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  validateRequiredFields(UpdateUserServicesFields),
  async (req, res) => {
    const body: z.infer<typeof UpdateUserServicesFields> = req.body;

    await UserModel.updateServiceUserBulk(body.service_id, body.data);
    res.status(204).send();
  },
);

userRouter.patch(
  '/service_hours',
  verifyJWT,
  validateRequiredFields(ServiceHoursFields),
  async (req, res) => {
    const body: z.infer<typeof ServiceHoursFields> = req.body;
    if (body.username) {
      // we are changing someone else's service hours
      const perms = await UserModel.checkPermissions(req.headers.username as string);
      if (!perms.includes(Permissions.ADMIN)) {
        throw new HTTPError(
          'Insufficient permissions',
          "Only admins can change other users' service hours",
          HTTPErrorCode.UNAUTHORIZED_ERROR,
        );
      }
      await UserModel.updateServiceHours(body.username, body.hours);
      res.status(204).send();
    } else {
      // we are changing our own service hours
      await UserModel.updateServiceHours(req.headers.username as string, body.hours);
      res.status(204).send();
    }
  },
);

userRouter.patch(
  '/service_hours_bulk',
  validateRequiredFields(ServiceHoursBulkFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof ServiceHoursBulkFields> = req.body;
    await UserModel.updateServiceHoursBulk(body);
    res.status(204).send();
  },
);

userRouter.patch(
  '/profile_picture',
  verifyJWT,
  validateRequiredFields(ProfilePictureFields),
  async (req, res) => {
    const body: z.infer<typeof ProfilePictureFields> = req.body;
    const presigned = await UserModel.updateProfilePicture(
      req.headers.username as string,
      body.profile_picture,
    );
    res.status(200).send(presigned);
  },
);

userRouter.delete('/profile_picture', verifyJWT, async (req, res) => {
  await UserModel.deleteProfilePicture(req.headers.username as string);
  res.status(204).send();
});

userRouter.get('/notifications', verifyJWT, async (req, res) => {
  const notifications = await UserModel.getNotifications(req.headers.username as string);
  res.status(200).send(notifications);
});
export default userRouter;
