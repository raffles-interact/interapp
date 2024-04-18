import { ExportsModel } from '@models/exports';
import { z } from 'zod';
import { validateRequiredFieldsV2 } from '@routes/middleware';
import { ExportsFields } from './validation';
import { Router } from 'express';

export const exportsRouter = Router();

const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

exportsRouter.get('/', validateRequiredFieldsV2(ExportsFields), async (req, res) => {
  const query = req.query as unknown as z.infer<typeof ExportsFields>;

  const exports = await ExportsModel.packXLSX(query.id, query.start_date, query.end_date);

  res.setHeader('Content-Type', xlsxMime);
  res.setHeader('Content-Disposition', 'attachment; filename=output.xlsx');
  res.type(xlsxMime);
  res.status(200).send(exports);
});
