import { Router } from 'express';
import { validateRequiredFields, verifyJWT, verifyRequiredPermission } from '../middleware';
import { ServiceModel } from '@models/service';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { Permissions } from '@utils/permissions';
import { AttendanceStatus } from '@db/entities';
import { UserModel } from '@models/user';

const serviceRouter = Router();

serviceRouter.post(
  '/',
  validateRequiredFields(
    ['name', 'contact_email', 'day_of_week', 'start_time', 'end_time', 'service_ic_username'],
    ['description', 'contact_number', 'website', 'promotional_image'],
  ),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    if (req.body.contact_number) {
      if (typeof req.body.contact_number !== 'number') {
        throw new HTTPError(
          'Invalid field type',
          'Contact number must be a number',
          HTTPErrorCode.BAD_REQUEST_ERROR,
        );
      }
      if (req.body.contact_number.toString().length !== 8) {
        throw new HTTPError(
          'Invalid field type',
          'Contact number must be of length 8',
          HTTPErrorCode.BAD_REQUEST_ERROR,
        );
      }
    }
    // validate start_time and end_time
    const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(req.body.start_time) || !timeRegex.test(req.body.end_time)) {
      throw new HTTPError(
        'Invalid field type',
        'start_time and end_time must be in the format HH:MM',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    // validate start_time < end_time
    const startTime = new Date().setHours(...(req.body.start_time.split(':') as [number, number]));
    const endTime = new Date().setHours(...(req.body.end_time.split(':') as [number, number]));
    if (startTime >= endTime) {
      throw new HTTPError(
        'Invalid field type',
        'start_time must be before end_time',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    // validate day_of_week
    if (
      typeof req.body.day_of_week !== 'number' ||
      req.body.day_of_week < 0 ||
      req.body.day_of_week > 6
    ) {
      throw new HTTPError(
        'Invalid field type',
        'day_of_week must be a number between 0 and 6',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

    const service_id = await ServiceModel.createService(req.body);
    res.status(200).send({
      service_id: service_id,
    });
  },
);

serviceRouter.get('/', validateRequiredFields(['service_id']), async (req, res) => {
  if (Number.isNaN(req.body.service_id)) {
    throw new HTTPError(
      'Invalid field type',
      'service_id must be a number',
      HTTPErrorCode.BAD_REQUEST_ERROR,
    );
  }

  const service = await ServiceModel.getService(Number(req.query.service_id));
  res.status(200).send(service);
});

serviceRouter.patch(
  '/',
  validateRequiredFields(
    ['service_id'],
    [
      'name',
      'description',
      'contact_email',
      'contact_number',
      'website',
      'promotional_image',
      'day_of_week',
      'start_time',
      'end_time',
      'service_ic_username',
    ],
  ),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    if (Number.isNaN(req.body.service_id)) {
      throw new HTTPError(
        'Invalid field type',
        'service_id must be a number',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

    const service = await ServiceModel.getService(Number(req.body.service_id));
    const updated = await ServiceModel.updateService({ ...service, ...req.body });
    res.status(200).send(updated);
  },
);

serviceRouter.delete(
  '/',
  validateRequiredFields(['service_id']),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    if (Number.isNaN(req.body.service_id)) {
      throw new HTTPError(
        'Invalid field type',
        'service_id must be a number',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

    await ServiceModel.deleteService(Number(req.body.service_id));
    res.status(204).send();
  },
);

serviceRouter.get('/get_all', async (req, res) => {
  const services = await ServiceModel.getAllServices();

  res.status(200).send({
    services,
  });
});

serviceRouter.get(
  '/get_users_by_service',
  validateRequiredFields(['service_id']),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const users = await UserModel.getAllUsersByService(Number(req.query.service_id));

    res.status(200).send({
      users,
    });
  },
);

serviceRouter.post(
  '/session',
  validateRequiredFields(['service_id', 'start_time', 'end_time', 'ad_hoc_enabled']),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    if (req.body.start_time >= req.body.end_time) {
      throw new HTTPError(
        'Invalid field type',
        'start_time must be before end_time',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

    const id = await ServiceModel.createServiceSession(req.body);
    res.status(200).send({
      service_session_id: id,
    });
  },
);

serviceRouter.get('/session', validateRequiredFields(['service_session_id']), async (req, res) => {
  const session = await ServiceModel.getServiceSession(Number(req.query.service_session_id));
  res.status(200).send(session);
});

serviceRouter.patch(
  '/session',
  validateRequiredFields(
    ['service_session_id'],
    ['service_id', 'start_time', 'end_time', 'ad_hoc_enabled'],
  ),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    const session = await ServiceModel.getServiceSession(Number(req.body.service_session_id));
    const updated = await ServiceModel.updateServiceSession({ ...session, ...req.body });
    res.status(200).send(updated);
  },
);

serviceRouter.delete(
  '/session',
  validateRequiredFields(['service_session_id']),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    await ServiceModel.deleteServiceSession(Number(req.body.service_session_id));
    res.status(204).send();
  },
);

serviceRouter.get(
  '/session/get_all',
  validateRequiredFields(['page', 'page_size'], ['service_id']),
  async (req, res) => {
    let sessions;
    if (req.query.service_id) {
      sessions = await ServiceModel.getAllServiceSessions(
        Number(req.query.page),
        Number(req.query.page_size),
        Number(req.query.service_id),
      );
    } else {
      sessions = await ServiceModel.getAllServiceSessions(
        Number(req.query.page),
        Number(req.query.page_size),
      );
    }
    res.status(200).send(sessions);
  },
);

serviceRouter.post(
  '/session_user',
  validateRequiredFields(['service_session_id', 'username', 'ad_hoc', 'attended', 'is_ic']),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    if (!(req.body.attended in AttendanceStatus)) {
      throw new HTTPError(
        'Invalid field type',
        `attended must be one of ${Object.values(AttendanceStatus)}`,
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    await ServiceModel.createServiceSessionUser(req.body);
    res.status(201).send();
  },
);

serviceRouter.post(
  '/session_user_bulk',
  validateRequiredFields(['service_session_id', 'users']),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    if (!Array.isArray(req.body.users)) {
      throw new HTTPError(
        'Invalid field type',
        'users must be an array of users',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    // validate users
    for (const user of req.body.users) {
      if (
        !(
          'username' in user &&
          'ad_hoc' in user &&
          'attended' in user &&
          'is_ic' in user &&
          Object.values(AttendanceStatus).some((status) => status === user.attended)
        )
      ) {
        throw new HTTPError(
          'Invalid field type',
          'users must be a valid array of users',
          HTTPErrorCode.BAD_REQUEST_ERROR,
        );
      }
    }
    for (const entry of req.body.users) {
      entry.service_session_id = req.body.service_session_id;
    }
    await ServiceModel.createServiceSessionUsers(req.body.users);
    res.status(201).send();
  },
);

serviceRouter.get(
  '/session_user',
  validateRequiredFields(['service_session_id', 'username']),
  async (req, res) => {
    const session_user = await ServiceModel.getServiceSessionUser(
      Number(req.query.service_session_id),
      String(req.query.username),
    );
    res.status(200).send(session_user);
  },
);

// gets service session user by service_session_id or by username
serviceRouter.get(
  '/session_user_bulk',
  validateRequiredFields([], ['service_session_id', 'username']),
  async (req, res) => {

    if (req.query.username && req.query.service_session_id) {
      throw new HTTPError(
        'Invalid field type',
        'Cannot query by both service_session_id and username -- use /session_user instead',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

    if (req.query.username) {
      const session_users = await UserModel.getAllServiceSessionsByUser(String(req.query.username));
      res.status(200).send(session_users);
    } else if (req.query.service_session_id) {

      const session_users = await ServiceModel.getServiceSessionUsers(
        Number(req.query.service_session_id),
      );
      res.status(200).send(session_users);
    } else {
      throw new HTTPError(
        'Invalid field type',
        'Must query by either service_session_id or username',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
  },
);

serviceRouter.patch(
  '/session_user',
  validateRequiredFields(['service_session_id', 'username'], ['ad_hoc', 'attended', 'is_ic']),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    if (req.body.attended && !(req.body.attended in AttendanceStatus)) {
      throw new HTTPError(
        'Invalid field type',
        `attended must be one of ${Object.values(AttendanceStatus)}`,
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    const session_user = await ServiceModel.getServiceSessionUser(
      Number(req.body.service_session_id),
      String(req.body.username),
    );
    const updated = await ServiceModel.updateServiceSessionUser({ ...session_user, ...req.body });
    res.status(200).send(updated);
  },
);

serviceRouter.delete(
  '/session_user',
  validateRequiredFields(['service_session_id', 'username']),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    await ServiceModel.deleteServiceSessionUser(
      Number(req.body.service_session_id),
      String(req.body.username),
    );
    res.status(204).send();
  },
);

serviceRouter.delete(
  '/session_user_bulk',
  validateRequiredFields(['service_session_id', 'usernames']),
  verifyJWT,
  verifyRequiredPermission(Permissions.SERVICE_IC, Permissions.MENTORSHIP_IC),
  async (req, res) => {
    await ServiceModel.deleteServiceSessionUsers(
      Number(req.body.service_session_id),
      req.body.usernames,
    );
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

serviceRouter.post(
  '/verify_attendance',
  validateRequiredFields(['hash']),
  verifyJWT,
  async (req, res) => {
    await ServiceModel.verifyAttendance(req.body.hash, req.headers.username as string);
    res.status(204).send();
  },
);

export default serviceRouter;
