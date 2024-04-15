import { ExportsModel } from '@models/exports';
import { Router } from 'express';

export const exportsRouter = Router();

const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

exportsRouter.get('/gm', async (req, res) => {
  const exports = await ExportsModel.getGMExports();

  res.setHeader('Content-Type', xlsxMime);
  res.setHeader('Content-Disposition', 'attachment; filename=general_meeting.xlsx');
  res.type(xlsxMime);
  res.status(200).send(exports);
});
