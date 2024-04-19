import { Router } from 'express';
import { validateRequiredFieldsV2, verifyJWT, verifyRequiredPermission } from '../../middleware';
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
  validateRequiredFieldsV2(CreateServiceFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const body: z.infer<typeof CreateServiceFields> = req.body;

    const service_id = await ServiceModel.createService(body);
    res.status(200).send({
      service_id: service_id,
    });
  },
);

serviceRouter.get('/', validateRequiredFieldsV2(ServiceIdFields), async (req, res) => {
  const query = req.query as unknown as z.infer<typeof ServiceIdFields>;

  const service = await ServiceModel.getService(Number(query.service_id));
  res.status(200).send(service);
});

serviceRouter.patch(
  '/',
  validateRequiredFieldsV2(UpdateServiceFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const body: z.infer<typeof UpdateServiceFields> = req.body;

    const service = await ServiceModel.getService(body.service_id);
    const updated = await ServiceModel.updateService({ ...service, ...body });
    res.status(200).send(updated);
  },
);

serviceRouter.delete(
  '/',
  validateRequiredFieldsV2(ServiceIdFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const body: z.infer<typeof ServiceIdFields> = req.body;
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
  validateRequiredFieldsV2(ServiceIdFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const query = req.query as unknown as z.infer<typeof ServiceIdFields>;
    const users = await UserModel.getAllUsersByService(Number(query.service_id));

    res.status(200).send(users);
  },
);

serviceRouter.post(
  '/session',
  validateRequiredFieldsV2(CreateServiceSessionFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof CreateServiceSessionFields> = req.body;
    const id = await ServiceModel.createServiceSession(body);
    res.status(200).send({
      service_session_id: id,
    });
  },
);

serviceRouter.get(
  '/session',
  validateRequiredFieldsV2(ServiceSessionIdFields),
  async (req, res) => {
    const query = req.query as unknown as z.infer<typeof ServiceSessionIdFields>;
    const session = await ServiceModel.getServiceSession(Number(query.service_session_id));
    res.status(200).send(session);
  },
);

serviceRouter.patch(
  '/session',
  validateRequiredFieldsV2(UpdateServiceSessionFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof UpdateServiceSessionFields> = req.body;
    const session = await ServiceModel.getServiceSession(body.service_session_id);
    const updated = await ServiceModel.updateServiceSession({ ...session, ...body });
    res.status(200).send(updated);
  },
);

serviceRouter.delete(
  '/session',
  validateRequiredFieldsV2(ServiceSessionIdFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof ServiceSessionIdFields> = req.body;
    await ServiceModel.deleteServiceSession(body.service_session_id);
    res.status(204).send();
  },
);

serviceRouter.get(
  '/session/all',
  validateRequiredFieldsV2(AllServiceSessionsFields),
  async (req, res) => {
    const query = req.query as unknown as z.infer<typeof AllServiceSessionsFields>;
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
  validateRequiredFieldsV2(CreateServiceSessionUserFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof CreateServiceSessionUserFields> = req.body;

    await ServiceModel.createServiceSessionUser(body);
    res.status(201).send();
  },
);

serviceRouter.post(
  '/session_user_bulk',
  validateRequiredFieldsV2(CreateBulkServiceSessionUserFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof CreateBulkServiceSessionUserFields> = req.body;

    const parsed = body.users.map((user) => {
      return { ...user, service_session_id: body.service_session_id };
    });
    await ServiceModel.createServiceSessionUsers(parsed);
    res.status(201).send();
  },
);

serviceRouter.get(
  '/session_user',
  validateRequiredFieldsV2(FindServiceSessionUserFields),
  async (req, res) => {
    const query = req.query as unknown as z.infer<typeof FindServiceSessionUserFields>;

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
  validateRequiredFieldsV2(ServiceSessionUserBulkFields),
  async (req, res) => {
    const query = req.query as unknown as z.infer<typeof ServiceSessionUserBulkFields>;

    if (query.hasOwnProperty('username')) {
      const session_users = await UserModel.getAllServiceSessionsByUser(String(req.query.username));
      res.status(200).send(session_users);
    } else if (query.hasOwnProperty('service_session_id')) {
      const session_users = await ServiceModel.getServiceSessionUsers(
        Number(req.query.service_session_id),
      );
      res.status(200).send(session_users);
    } else
      throw new HTTPError('?????', 'unreachable code path', HTTPErrorCode.INTERNAL_SERVER_ERROR);
  },
);

serviceRouter.patch(
  '/session_user',
  validateRequiredFieldsV2(UpdateServiceSessionUserFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof UpdateServiceSessionUserFields> = req.body;

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
  validateRequiredFieldsV2(ServiceSessionUserIdFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.CLUB_MEMBER),
  async (req, res) => {
    const body: z.infer<typeof ServiceSessionUserIdFields> = req.body;
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
  validateRequiredFieldsV2(ServiceSessionUserIdFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof ServiceSessionUserIdFields> = req.body;
    await ServiceModel.deleteServiceSessionUser(
      Number(body.service_session_id),
      String(body.username),
    );
    res.status(204).send();
  },
);

serviceRouter.delete(
  '/session_user_bulk',
  validateRequiredFieldsV2(DeleteBulkServiceSessionUserFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const body: z.infer<typeof DeleteBulkServiceSessionUserFields> = req.body;
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
  validateRequiredFieldsV2(VerifyAttendanceFields),
  verifyJWT,
  async (req, res) => {
    const body: z.infer<typeof VerifyAttendanceFields> = req.body;
    await ServiceModel.verifyAttendance(body.hash, req.headers.username as string);
    res.status(204).send();
  },
);

export default serviceRouter;
