import { Router } from 'express';
import { validateRequiredFields, verifyJWT, verifyRequiredPermission } from '../../middleware';
import {
  ServiceIdFields,
  UpdateServiceFields,
  CreateServiceFields,
  CreateServiceSessionFields,
  UpdateServiceSessionFields,
  AllServiceSessionsFields,
  ServiceSessionUserIdFields,
  CreateServiceSessionUserFields,
  ServiceSessionUserBulkFields,
  CreateBulkServiceSessionUserFields,
  UpdateServiceSessionUserFields,
  DeleteBulkServiceSessionUserFields,
  VerifyAttendanceFields,
  ServiceSessionIdFields,
  FindServiceSessionUserFields,
} from './validation';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { Permissions } from '@utils/permissions';
import { UserModel, ServiceModel } from '@models/.';
import { z } from 'zod';
import { AttendanceStatus } from '@db/entities';

const serviceRouter = Router();

serviceRouter.post(
  '/',
  validateRequiredFields(CreateServiceFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const body: z.infer<typeof CreateServiceFields> = res.locals.body;

    const service_id = await ServiceModel.createService(body);
    res.status(200).send({
      service_id: service_id,
    });
  },
);

serviceRouter.get('/', validateRequiredFields(ServiceIdFields), async (req, res) => {
  const query: z.infer<typeof ServiceIdFields> = res.locals.query;

  const service = await ServiceModel.getService(Number(query.service_id));
  res.status(200).send(service);
});

serviceRouter.patch(
  '/',
  validateRequiredFields(UpdateServiceFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const body: z.infer<typeof UpdateServiceFields> = res.locals.body;

    const service = await ServiceModel.getService(body.service_id);
    const updated = await ServiceModel.updateService({ ...service, ...body });
    res.status(200).send(updated);
  },
);

serviceRouter.delete(
  '/',
  validateRequiredFields(ServiceIdFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const body: z.infer<typeof ServiceIdFields> = res.locals.body;
    await ServiceModel.deleteService(body.service_id);
    res.status(204).send();
  },
);

serviceRouter.get('/all', async (req, res) => {
  const services = await ServiceModel.getAllServices();

  res.status(200).send(services);
});

serviceRouter.get(
  '/get_users_by_service',
  validateRequiredFields(ServiceIdFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const query: z.infer<typeof ServiceIdFields> = res.locals.query;
    const users = await UserModel.getAllUsersByService(Number(query.service_id));

    res.status(200).send(users);
  },
);

serviceRouter.post(
  '/session',
  validateRequiredFields(CreateServiceSessionFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof CreateServiceSessionFields> = res.locals.body;
    const id = await ServiceModel.createServiceSession(body);
    res.status(200).send({
      service_session_id: id,
    });
  },
);

serviceRouter.get('/session', validateRequiredFields(ServiceSessionIdFields), async (req, res) => {
  const query: z.infer<typeof ServiceSessionIdFields> = res.locals.query;
  const session = await ServiceModel.getServiceSession(Number(query.service_session_id));
  res.status(200).send(session);
});

serviceRouter.patch(
  '/session',
  validateRequiredFields(UpdateServiceSessionFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof UpdateServiceSessionFields> = res.locals.body;
    const session = await ServiceModel.getServiceSession(body.service_session_id);
    const updated = await ServiceModel.updateServiceSession({ ...session, ...body });
    res.status(200).send(updated);
  },
);

serviceRouter.delete(
  '/session',
  validateRequiredFields(ServiceSessionIdFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof ServiceSessionIdFields> = res.locals.body;
    await ServiceModel.deleteServiceSession(body.service_session_id);
    res.status(204).send();
  },
);

serviceRouter.get(
  '/session/all',
  validateRequiredFields(AllServiceSessionsFields),
  async (req, res) => {
    const query: z.infer<typeof AllServiceSessionsFields> = res.locals.query;
    let sessions;
    if (query.service_id) {
      sessions = await ServiceModel.getAllServiceSessions(
        Number(query.page),
        Number(query.page_size),
        Number(query.service_id),
      );
    } else {
      sessions = await ServiceModel.getAllServiceSessions(
        Number(query.page),
        Number(query.page_size),
      );
    }
    res.status(200).send(sessions);
  },
);

serviceRouter.post(
  '/session_user',
  validateRequiredFields(CreateServiceSessionUserFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof CreateServiceSessionUserFields> = res.locals.body;

    await ServiceModel.createServiceSessionUser(body);
    res.status(201).send();
  },
);

serviceRouter.post(
  '/session_user_bulk',
  validateRequiredFields(CreateBulkServiceSessionUserFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof CreateBulkServiceSessionUserFields> = res.locals.body;

    const parsed = body.users.map((user) => {
      return { ...user, service_session_id: body.service_session_id };
    });
    await ServiceModel.createServiceSessionUsers(parsed);
    res.status(201).send();
  },
);

serviceRouter.get(
  '/session_user',
  validateRequiredFields(FindServiceSessionUserFields),
  async (req, res) => {
    const query: z.infer<typeof FindServiceSessionUserFields> = res.locals.query;

    const session_user = await ServiceModel.getServiceSessionUser(
      Number(query.service_session_id),
      String(query.username),
    );
    res.status(200).send(session_user);
  },
);

// gets service session user by service_session_id or by username
serviceRouter.get(
  '/session_user_bulk',
  validateRequiredFields(ServiceSessionUserBulkFields),
  async (req, res) => {
    const query: z.infer<typeof ServiceSessionUserBulkFields> = res.locals.query;

    if (Object.prototype.hasOwnProperty.call(query, 'username')) {
      const session_users = await UserModel.getAllServiceSessionsByUser(
        String(res.locals.query.username),
      );
      res.status(200).send(session_users);
    } else if (Object.prototype.hasOwnProperty.call(query, 'service_session_id')) {
      const session_users = await ServiceModel.getServiceSessionUsers(
        Number(res.locals.query.service_session_id),
      );
      res.status(200).send(session_users);
    } else
      throw new HTTPError('?????', 'unreachable code path', HTTPErrorCode.INTERNAL_SERVER_ERROR);
  },
);

serviceRouter.patch(
  '/session_user',
  validateRequiredFields(UpdateServiceSessionUserFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof UpdateServiceSessionUserFields> = res.locals.body;

    const session_user = await ServiceModel.getServiceSessionUser(
      Number(body.service_session_id),
      String(body.username),
    );
    const updated = await ServiceModel.updateServiceSessionUser({ ...session_user, ...body });
    res.status(200).send(updated);
  },
);

serviceRouter.patch(
  '/absence',
  validateRequiredFields(ServiceSessionUserIdFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.CLUB_MEMBER),
  async (req, res) => {
    const body: z.infer<typeof ServiceSessionUserIdFields> = res.locals.body;
    const session_user = await ServiceModel.getServiceSessionUser(
      Number(body.service_session_id),
      String(body.username),
    );
    await ServiceModel.updateServiceSessionUser({
      ...session_user,
      attended: AttendanceStatus.ValidReason,
    });
    res.status(204).send();
  },
);

serviceRouter.delete(
  '/session_user',
  validateRequiredFields(ServiceSessionUserIdFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof ServiceSessionUserIdFields> = res.locals.body;
    await ServiceModel.deleteServiceSessionUser(
      Number(body.service_session_id),
      String(body.username),
    );
    res.status(204).send();
  },
);

serviceRouter.delete(
  '/session_user_bulk',
  validateRequiredFields(DeleteBulkServiceSessionUserFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof DeleteBulkServiceSessionUserFields> = res.locals.body;
    await ServiceModel.deleteServiceSessionUsers(Number(body.service_session_id), body.usernames);
    res.status(204).send();
  },
);

serviceRouter.get(
  '/active_sessions',
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const sessions = await ServiceModel.getActiveServiceSessions();
    res.status(200).send(sessions);
  },
);

serviceRouter.get('/ad_hoc_sessions', verifyJWT, async (req, res) => {
  const sessions = await ServiceModel.getAdHocServiceSessions();
  res.status(200).send(sessions);
});

serviceRouter.post(
  '/verify_attendance',
  validateRequiredFields(VerifyAttendanceFields),
  verifyJWT,
  async (req, res) => {
    const body: z.infer<typeof VerifyAttendanceFields> = res.locals.body;
    const meta = await ServiceModel.verifyAttendance(body.hash, req.headers.username as string);
    res.status(200).send(meta);
  },
);

export default serviceRouter;
