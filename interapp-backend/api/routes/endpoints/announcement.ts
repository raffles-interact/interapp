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
  upload.array('docs', 10),
  validateRequiredFields(['creation_date', 'title', 'description', 'username'], ['image']),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;

    console.log(req.body);

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
    const announcement = await AnnouncementModel.getAnnouncement(Number(req.body.announcement_id));
    res.status(200).json(announcement);
  },
);

announcementRouter.get('/all', verifyJWT, async (req, res) => {
  const announcements = await AnnouncementModel.getAnnouncements();
  res.status(200).json(announcements);
});

announcementRouter.patch(
  '/',
  validateRequiredFields(
    ['announcement_id'],
    ['creation_date', 'username', 'title', 'description', 'attatchment'],
  ),
  verifyJWT,
  verifyRequiredPermission(Permissions.EXCO),
  async (req, res) => {
    const ISO8601Regex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/;
    if (req.body.creation_date && !ISO8601Regex.test(req.body.creation_date)) {
      throw new HTTPError(
        'Invalid field type',
        'start_time and end_time must be in the format YYYY-MM-DDTHH:MMZ',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    const announcement = await AnnouncementModel.getAnnouncement(Number(req.body.announcement_id));
    const updated = await AnnouncementModel.updateAnnouncement({ ...announcement, ...req.body });
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
  '/completions',
  validateRequiredFields(['announcement_id']),
  verifyJWT,
  async (req, res) => {
    const completions = await AnnouncementModel.getAnnouncementCompletions(
      Number(req.query.announcement_id),
    );

    res.status(200).send(completions);
  },
);

announcementRouter.post(
  '/completions',
  validateRequiredFields(['announcement_id', 'usernames']),
  verifyJWT,
  async (req, res) => {
    if (
      !Array.isArray(req.body.usernames) ||
      !req.body.usernames.every((username: unknown) => typeof username === 'string')
    ) {
      throw new HTTPError(
        'Invalid field type',
        'usernames must be an array of strings',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }
    await AnnouncementModel.addAnnouncementCompletions(
      req.body.announcement_id,
      req.body.usernames,
    );
    res.status(201).send();
  },
);

announcementRouter.patch(
  '/completion',
  validateRequiredFields(['announcement_id', 'username', 'completed']),
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
      req.body.username,
      req.body.completed,
    );
    res.status(204).send();
  },
);
export default announcementRouter;
