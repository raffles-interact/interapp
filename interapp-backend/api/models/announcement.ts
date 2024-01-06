import appDataSource from '@utils/init_datasource';
import { Announcement, AnnouncementCompletion, AnnouncementAttachment } from '@db/entities';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { UserModel } from './user';
import { User } from '@db/entities';
import minioClient from '@utils/init_minio';
import dataUrlToBuffer from '@utils/dataUrlToBuffer';

export class AnnouncementModel {
  public static async createAnnouncement(
    announcement: Omit<
      Announcement,
      'announcement_id' | 'user' | 'announcement_completions' | 'announcement_attachments'
    > & { attachments: Express.Multer.File[] },
  ) {
    const newAnnouncement = new Announcement();
    newAnnouncement.creation_date = announcement.creation_date;
    newAnnouncement.description = announcement.description;

    newAnnouncement.username = announcement.username;
    newAnnouncement.title = announcement.title;
    if (!announcement.image) newAnnouncement.image = null;
    else {
      const convertedFile = dataUrlToBuffer(announcement.image);

      if (!convertedFile) {
        throw new HTTPError(
          'Invalid promotional image',
          'Promotional image is not a valid data URL',
          HTTPErrorCode.BAD_REQUEST_ERROR,
        );
      }
      await minioClient.putObject(
        process.env.MINIO_BUCKETNAME as string,
        'announcement/' + announcement.title,
        convertedFile.buffer,
        { 'Content-Type': convertedFile.mimetype },
      );
      newAnnouncement.image = 'announcement/' + announcement.title;
    }

    const user = await UserModel.getUser(announcement.username);
    newAnnouncement.user = user;
    newAnnouncement.username = user.username;

    const allUsers = (await UserModel.getUserDetails()) as Omit<
      User,
      | 'password_hash'
      | 'refresh_token'
      | 'user_permissions'
      | 'user_services'
      | 'service_session_users'
    >[];
    const completions = allUsers.map((user) => {
      const completion = new AnnouncementCompletion();
      completion.user = user as User; // why: for some godforsaken reason, typeorm requires the all the details of the user when in reality it only requires the PK
      completion.username = user.username;
      completion.completed = false;
      completion.announcement = newAnnouncement;

      return completion;
    });
    newAnnouncement.announcement_completions = completions;

    const attachments = await Promise.all(
      announcement.attachments.map(async (attachment, idx) => {
        const newAttachment = new AnnouncementAttachment();

        newAttachment.announcement = newAnnouncement;
        newAttachment.attachment_id = 'announcement-attachment/' + announcement.title + '-' + idx;
        await minioClient.putObject(
          process.env.MINIO_BUCKETNAME as string,
          newAttachment.attachment_id,
          attachment.buffer,
          { 'Content-Type': attachment.mimetype },
        );

        newAttachment.attachment_name = attachment.originalname;
        return newAttachment;
      }),
    );

    try {
      const announcementIdResult = await appDataSource.manager
        .createQueryBuilder()
        .insert()
        .into(Announcement)
        .values(newAnnouncement)
        .returning('announcement_id')
        .execute();
      const announcementId = announcementIdResult.raw[0].announcement_id;
      await appDataSource.manager.insert(
        AnnouncementCompletion,
        completions.map((completion) => ({ ...completion, announcement_id: announcementId })),
      );
      await appDataSource.manager.insert(
        AnnouncementAttachment,
        attachments.map((attachment) => ({ ...attachment, announcement_id: announcementId })),
      );
    } catch (e) {
      throw new HTTPError(
        'Announcement already exists',
        `Announcement with title ${announcement.title} already exists`,
        HTTPErrorCode.CONFLICT_ERROR,
      );
    }

    return newAnnouncement.announcement_id;
  }
  public static async getAnnouncement(announcement_id: number) {
    const announcement = await appDataSource.manager
      .createQueryBuilder()
      .select('announcement')
      .from(Announcement, 'announcement')
      .where('announcement.announcement_id = :announcement_id', { announcement_id })
      .getOne();
    if (!announcement) {
      throw new HTTPError(
        'Announcement not found',
        `Announcement with id ${announcement_id} not found`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    return announcement;
  }
  public static async getAnnouncements() {
    const announcements = await appDataSource.manager
      .createQueryBuilder()
      .select('announcement')
      .from(Announcement, 'announcement')
      .getMany();
    return announcements;
  }
  public static async updateAnnouncement(
    new_announcement: Omit<Announcement, 'user' | 'announcement_completions'>,
  ) {
    const announcement: Partial<Announcement> = new_announcement;
    announcement.user = await UserModel.getUser(new_announcement.username);

    try {
      await appDataSource.manager.update(
        Announcement,
        { announcement_id: new_announcement.announcement_id },
        announcement,
      );
    } catch (e) {
      throw new HTTPError('DB error', String(e), HTTPErrorCode.BAD_REQUEST_ERROR);
    }
    return await this.getAnnouncement(new_announcement.announcement_id);
  }
  public static async deleteAnnouncement(announcement_id: number) {
    await appDataSource.manager.delete(Announcement, { announcement_id });
  }
  public static async getAnnouncementCompletions(announcement_id: number) {
    const announcement = await this.getAnnouncement(announcement_id);
    if (!announcement) {
      throw new HTTPError(
        'Announcement not found',
        `Announcement with id ${announcement_id} not found`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    const completions = await appDataSource.manager
      .createQueryBuilder()
      .select(['announcement_completion.username', 'announcement_completion.completed'])
      .from(AnnouncementCompletion, 'announcement_completion')
      .where('announcement_completion.announcement_id = :announcement_id', { announcement_id })
      .getMany();
    return Object.fromEntries(
      completions.map((completion) => [completion.username, completion.completed]),
    );
  }
  public static async addAnnouncementCompletions(announcement_id: number, usernames: string[]) {
    const announcement = await this.getAnnouncement(announcement_id);
    const completions = await Promise.all(
      usernames.map(async (username) => {
        const completion = new AnnouncementCompletion();
        completion.announcement = announcement;
        completion.announcement_id = announcement_id;
        completion.username = username;
        completion.user = await UserModel.getUser(username);
        completion.completed = false;
        return completion;
      }),
    );

    await appDataSource.manager.insert(AnnouncementCompletion, completions);
  }
  public static async updateAnnouncementCompletion(
    announcement_id: number,
    username: string,
    completed: boolean,
  ) {
    const user = await UserModel.getUser(username);
    const announcement = await this.getAnnouncement(announcement_id);
    if (!user) {
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    if (!announcement) {
      throw new HTTPError(
        'Announcement not found',
        `Announcement with id ${announcement_id} not found`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    await appDataSource.manager.update(
      AnnouncementCompletion,
      { announcement_id, username },
      { completed, user, announcement },
    );
  }
}
