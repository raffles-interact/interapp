import { Router } from 'express';
import { validateRequiredFields, verifyJWT, verifyRequiredPermission } from '../../middleware';
import {
  AnnouncementIdFields,
  CreateAnnouncementFields,
  UpdateAnnouncementFields,
  PaginationFields,
  AnnouncementCompletionFields,
} from './validation';
import { AnnouncementModel } from '@models/.';
import { Permissions } from '@utils/permissions';
import multer from 'multer';
import { z } from 'zod';

const upload = multer();

const announcementRouter = Router();

announcementRouter.post(
  '/',
  upload.array('attachments', 10),
  validateRequiredFields(CreateAnnouncementFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;

    const body: z.infer<typeof CreateAnnouncementFields> = req.body;
    const announcement_id = await AnnouncementModel.createAnnouncement({
      ...body,
      attachments: files,
    });
    res.status(201).send({
      announcement_id,
    });
  },
);

announcementRouter.get(
  '/',
  validateRequiredFields(AnnouncementIdFields),
  verifyJWT,
  async (req, res) => {
    const query = req.query as unknown as z.infer<typeof AnnouncementIdFields>;
    const announcement = await AnnouncementModel.getAnnouncement(Number(query.announcement_id));
    res.status(200).json(announcement);
  },
);

announcementRouter.get(
  '/all',
  validateRequiredFields(PaginationFields),
  verifyJWT,
  async (req, res) => {
    const query = req.query as unknown as z.infer<typeof PaginationFields>;
    const announcements = await AnnouncementModel.getAnnouncements(
      Number(query.page),
      Number(query.page_size),
    );
    res.status(200).json(announcements);
  },
);

announcementRouter.patch(
  '/',
  upload.array('attachments', 10),
  validateRequiredFields(UpdateAnnouncementFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const body: z.infer<typeof UpdateAnnouncementFields> = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    const updated = await AnnouncementModel.updateAnnouncement({ ...body, attachments: files });
    res.status(200).json(updated);
  },
);

announcementRouter.delete(
  '/',
  validateRequiredFields(AnnouncementIdFields),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const body: z.infer<typeof AnnouncementIdFields> = req.body;
    await AnnouncementModel.deleteAnnouncement(Number(body.announcement_id));
    res.status(204).send();
  },
);

announcementRouter.get(
  '/completion',
  validateRequiredFields(AnnouncementIdFields),
  verifyJWT,
  async (req, res) => {
    const completions = await AnnouncementModel.getAnnouncementCompletions(
      Number(req.query.announcement_id),
    );

    res.status(200).send(completions);
  },
);

announcementRouter.patch(
  '/completion',
  validateRequiredFields(AnnouncementCompletionFields),
  verifyJWT,
  async (req, res) => {
    const body: z.infer<typeof AnnouncementCompletionFields> = req.body;
    await AnnouncementModel.updateAnnouncementCompletion(
      body.announcement_id,
      req.headers.username as string,
      body.completed,
    );
    res.status(204).send();
  },
);
export default announcementRouter;
