import { Router } from 'express';
import { validateRequiredFields, verifyJWT, verifyRequiredRole } from '../middleware';
import { ServiceModel } from '@models/service';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { Permissions } from '@utils/permissions';

const serviceRouter = Router();

serviceRouter.post(
  '/',
  validateRequiredFields(
    ['name', 'contact_email', 'day_of_week', 'start_time', 'end_time'],
    ['description', 'contact_number', 'website', 'promotional_image'],
  ),
  verifyJWT,
  verifyRequiredRole(Permissions.EXCO),
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
    const timeRegex = new RegExp('^([0-1][0-9]|2[0-3]):[0-5][0-9]$');
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

    const serviceId = await ServiceModel.createService(req.body);
    res.status(200).send({
      serviceId: serviceId,
    });
  },
);

serviceRouter.get('/', validateRequiredFields(['serviceId']), async (req, res) => {
  if (Number.isNaN(req.body.serviceId)) {
    throw new HTTPError(
      'Invalid field type',
      'serviceId must be a number',
      HTTPErrorCode.BAD_REQUEST_ERROR,
    );
  }

  const service = await ServiceModel.getService(Number(req.query.serviceId));
  res.status(200).send(service);
});

serviceRouter.patch(
  '/',
  validateRequiredFields(
    ['serviceId'],
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
    ],
  ),
  verifyJWT,
  verifyRequiredRole(Permissions.EXCO),
  async (req, res) => {
    if (Number.isNaN(req.body.serviceId)) {
      throw new HTTPError(
        'Invalid field type',
        'serviceId must be a number',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

    const service = await ServiceModel.getService(Number(req.body.serviceId));
    delete req.body.serviceId; // remove serviceId from req.body to prevent conflict with service.service_id
    const updated = await ServiceModel.updateService({ ...service, ...req.body });
    res.status(200).send(updated);
  },
);

serviceRouter.delete(
  '/',
  validateRequiredFields(['serviceId']),
  verifyJWT,
  verifyRequiredRole(Permissions.EXCO),
  async (req, res) => {
    if (Number.isNaN(req.body.serviceId)) {
      throw new HTTPError(
        'Invalid field type',
        'serviceId must be a number',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

    await ServiceModel.deleteService(Number(req.body.serviceId));
    res.status(204).send();
  },
);

serviceRouter.get('/get_all', async (req, res) => {
  const services = await ServiceModel.getAllServices();

  res.status(200).send({
    services,
  });
});

serviceRouter.post(
  '/session',
  validateRequiredFields(['service_id', 'start_time', 'end_time', 'ad_hoc_enabled']),
  verifyJWT,
  verifyRequiredRole(Permissions.SERVICE_IC),
  async (req, res) => {
    const ISO8601Regex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/;
    if (!ISO8601Regex.test(req.body.start_time) || !ISO8601Regex.test(req.body.end_time)) {
      throw new HTTPError(
        'Invalid field type',
        'start_time and end_time must be in the format YYYY-MM-DDTHH:MMZ',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

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
  verifyRequiredRole(Permissions.SERVICE_IC),
  async (req, res) => {
    const session = await ServiceModel.getServiceSession(Number(req.body.service_session_id));
    const updated = await ServiceModel.updateServiceSession({ ...session, ...req.body });
    res.status(200).send(updated);
  },
);

serviceRouter.delete(
  '/session',
  validateRequiredFields(['service_session_id']),
  async (req, res) => {
    await ServiceModel.deleteServiceSession(Number(req.body.service_session_id));
    res.status(204).send();
  },
);
export default serviceRouter;