import { Router } from 'express';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { validateRequiredFields, verifyJWT, verifyRequiredRole } from '../middleware';
import { AnnouncementModel } from '@models/announcement';
import { Permissions } from '@utils/permissions';

const announcementRouter = Router();

announcementRouter.post(
  '/',
  validateRequiredFields(['creation_date', 'description', 'username'], ['attatchment']),
  verifyJWT,
  verifyRequiredRole(Permissions.EXCO),
  async (req, res) => {
    const announcement = await AnnouncementModel.createAnnouncement(req.body);
    res.status(201).json(announcement);
  },
);

announcementRouter.get('/', validateRequiredFields(['announcement_id']), verifyJWT, async (req, res) => {
  const announcement = await AnnouncementModel.getAnnouncement(Number(req.body.announcement_id));
  res.status(200).json(announcement);
});

announcementRouter.get('/all', verifyJWT, async (req, res) => {
  const announcements = await AnnouncementModel.getAnnouncements();
  res.status(200).json(announcements);
});

announcementRouter.patch(
  '/',
  validateRequiredFields(['announcement_id'], ['creation_date', 'username', 'description', 'attatchment']),
  verifyJWT,
  verifyRequiredRole(Permissions.EXCO),
  async (req, res) => {
    const announcement = await AnnouncementModel.getAnnouncement(Number(req.body.announcement_id));
    const updated = await AnnouncementModel.updateAnnouncement({ ...announcement, ...req.body });
    res.status(200).json(updated);
  },
);

announcementRouter.delete(
  '/',
  validateRequiredFields(['announcement_id']),
  verifyJWT,
  verifyRequiredRole(Permissions.EXCO),
  async (req, res) => {
    await AnnouncementModel.deleteAnnouncement(Number(req.body.announcement_id));
    res.status(204).send();
  },
);

export default announcementRouter;
