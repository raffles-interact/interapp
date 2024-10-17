import { AttendanceExportsModel, ServiceHoursExportsModel } from '@models/exports';
import { z } from 'zod';
import { validateRequiredFields, verifyJWT, verifyRequiredPermission } from '@routes/middleware';
import { AttendanceExportsFields, ServiceHoursExportsFields } from './validation';
import { Router } from 'express';
import { Permissions } from '@utils/permissions';

export const exportsRouter = Router();

const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

exportsRouter.get(
  '/',
  validateRequiredFields(AttendanceExportsFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.ATTENDANCE_MANAGER),
  async (req, res) => {
    const query: z.infer<typeof AttendanceExportsFields> = res.locals.query;

    const exports = await AttendanceExportsModel.packXLSX(
      query.id,
      query.start_date,
      query.end_date,
    );

    res.setHeader('Content-Type', xlsxMime);
    res.setHeader('Content-Disposition', 'attachment; filename=output.xlsx');
    res.type(xlsxMime);
    res.status(200).send(exports);
  },
);
exportsRouter.get(
  '/service_hours',
  validateRequiredFields(ServiceHoursExportsFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.ATTENDANCE_MANAGER),
  async (req, res) => {
    const query: z.infer<typeof ServiceHoursExportsFields> = res.locals.query;

    const exports = await ServiceHoursExportsModel.packXLSX(query.type, query.order);

    res.setHeader('Content-Type', xlsxMime);
    res.setHeader('Content-Disposition', 'attachment; filename=output.xlsx');
    res.type(xlsxMime);
    res.status(200).send(exports);
  },
);
