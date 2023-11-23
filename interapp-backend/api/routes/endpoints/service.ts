import { Router } from 'express';
import { validateRequiredFields, verifyJWT, verifyRequiredRole } from '../middleware';
import { ServiceModel } from '@models/service';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { Permissions } from '@utils/permissions';

const serviceRouter = Router();

serviceRouter.post(
  '/create',
  validateRequiredFields(
    ['name', 'contact_email'],
    ['description', 'contact_number', 'website', 'promotional_image'],
  ),
  verifyJWT,
  verifyRequiredRole(Permissions.EXCO),
  async (req, res) => {
    if (req.body.contact_number) {
      if (typeof req.body.contact_number !== 'number') {
        throw new HTTPError(
          'Invalid field type',
          'userId must be a number',
          HTTPErrorCode.BAD_REQUEST_ERROR,
        );
      }
      if (req.body.contact_number.toString().length !== 8) {
        throw new HTTPError(
          'Invalid field type',
          'userId must be of length 8',
          HTTPErrorCode.BAD_REQUEST_ERROR,
        );
      }
    }
    const serviceId = await ServiceModel.createService(req.body);
    res.status(200).send({
      serviceId: serviceId,
    });
  },
);

serviceRouter.get('/get', validateRequiredFields(['serviceId']), async (req, res) => {
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
  '/update',
  validateRequiredFields(
    ['serviceId'],
    ['name', 'description', 'contact_email', 'contact_number', 'website', 'promotional_image'],
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

    const updated = await ServiceModel.updateService({ ...service, ...req.body });
    res.status(200).send(updated);
  },
);

serviceRouter.delete(
  '/delete',
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

export default serviceRouter;
