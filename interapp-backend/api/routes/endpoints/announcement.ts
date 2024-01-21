import { Router } from 'express';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { validateRequiredFields, verifyJWT, verifyRequiredPermission } from '../middleware';
import { AnnouncementModel } from '@models/announcement';
import { Permissions } from '@utils/permissions';
import multer from 'multer';

const upload = multer();

const announcementRouter = Router();

announcementRouter.post(
  '/',
  upload.array('attachments', 10),
  validateRequiredFields(['creation_date', 'title', 'description', 'username'], ['image']),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;

    const announcement_id = await AnnouncementModel.createAnnouncement({
      ...req.body,
      attachments: files,
    });
    res.status(201).send({
      announcement_id,
    });
  },
);

announcementRouter.get(
  '/',
  validateRequiredFields(['announcement_id']),
  verifyJWT,
  async (req, res) => {
    const announcement = await AnnouncementModel.getAnnouncement(Number(req.query.announcement_id));
    res.status(200).json(announcement);
  },
);

announcementRouter.get(
  '/all',
  validateRequiredFields(['page', 'page_size']),
  verifyJWT,
  async (req, res) => {
    const announcements = await AnnouncementModel.getAnnouncements(
      Number(req.query.page),
      Number(req.query.page_size),
    );
    res.status(200).json(announcements);
  },
);

announcementRouter.patch(
  '/',
  upload.array('attachments', 10),
  validateRequiredFields(
    ['announcement_id'],
    ['creation_date', 'title', 'description', 'username', 'image'],
  ),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;

    const updated = await AnnouncementModel.updateAnnouncement({ ...req.body, attachments: files });
    res.status(200).json(updated);
  },
);

announcementRouter.delete(
  '/',
  validateRequiredFields(['announcement_id']),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    await AnnouncementModel.deleteAnnouncement(Number(req.body.announcement_id));
    res.status(204).send();
  },
);

announcementRouter.get(
  '/completion',
  validateRequiredFields(['announcement_id']),
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
  validateRequiredFields(['announcement_id', 'completed']),
  verifyJWT,
  async (req, res) => {
    if (typeof req.body.completed !== 'boolean') {
      throw new HTTPError(
        'Invalid field type',
        'completed must be a boolean',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    await AnnouncementModel.updateAnnouncementCompletion(
      req.body.announcement_id,
      req.headers.username as string,
      req.body.completed,
    );
    res.status(204).send();
  },
);
export default announcementRouter;
