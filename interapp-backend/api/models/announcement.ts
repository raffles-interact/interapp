import appDataSource from '@utils/init_datasource';
import { Announcement, AnnouncementCompletion, AnnouncementAttachment, User } from '@db/entities';
import { HTTPErrors } from '@utils/errors';
import { UserModel } from './user';
import minioClient from '@utils/init_minio';
import dataUrlToBuffer from '@utils/dataUrlToBuffer';

const MINIO_BUCKETNAME = process.env.MINIO_BUCKETNAME as string;
export class AnnouncementModel {
  public static async createAnnouncement(
    announcement: Omit<
      Announcement,
      'announcement_id' | 'user' | 'announcement_completions' | 'announcement_attachments'
    > & { attachments?: Express.Multer.File[] },
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
        throw HTTPErrors.INVALID_DATA_URL;
      }
      await minioClient.putObject(
        MINIO_BUCKETNAME,
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

    let attachments: AnnouncementAttachment[] | null = null;
    if (!announcement.attachments) {
      newAnnouncement.announcement_attachments = [];
    } else {
      attachments = await Promise.all(
        announcement.attachments.map(async (attachment, idx) => {
          const newAttachment = new AnnouncementAttachment();

          newAttachment.announcement = newAnnouncement;
          newAttachment.attachment_loc =
            'announcement-attachment/' + announcement.title + '-' + idx;
          await minioClient.putObject(
            MINIO_BUCKETNAME,
            newAttachment.attachment_loc,
            attachment.buffer,
            { 'Content-Type': attachment.mimetype },
          );

          newAttachment.attachment_name = attachment.originalname;
          newAttachment.attachment_mime = attachment.mimetype;
          return newAttachment;
        }),
      );
      newAnnouncement.announcement_attachments = attachments;
    }

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
      if (attachments)
        await appDataSource.manager.insert(
          AnnouncementAttachment,
          attachments.map((attachment) => ({ ...attachment, announcement_id: announcementId })),
        );
    } catch (e) {
      throw HTTPErrors.ALREADY_EXISTS;
    }

    return newAnnouncement.announcement_id;
  }
  public static async getAnnouncement(announcementId: number) {
    const announcement = await appDataSource.manager
      .createQueryBuilder()
      .select('announcement')
      .from(Announcement, 'announcement')
      .where('announcement.announcement_id = :announcement_id', { announcement_id: announcementId })
      .leftJoinAndSelect('announcement.announcement_attachments', 'announcement_attachments')
      .leftJoinAndSelect('announcement.announcement_completions', 'announcement_completions')
      .getOne();

    if (!announcement) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }
    if (announcement.image)
      announcement.image = await minioClient.presignedGetObject(
        MINIO_BUCKETNAME,
        announcement.image,
        60 * 60 * 24 * 7,
      );
    announcement.announcement_attachments = await Promise.all(
      announcement.announcement_attachments.map(async (attachment) => {
        attachment.attachment_loc = await minioClient.presignedGetObject(
          MINIO_BUCKETNAME,
          attachment.attachment_loc,
          60 * 60 * 24 * 7,
        );
        return attachment;
      }),
    );

    return announcement;
  }
  public static async getAnnouncements(page?: number, perPage?: number) {
    const data = await appDataSource.manager
      .createQueryBuilder()
      .select('announcement')
      .from(Announcement, 'announcement')
      .leftJoinAndSelect('announcement.announcement_attachments', 'announcement_attachments')
      .leftJoinAndSelect('announcement.announcement_completions', 'announcement_completions')
      .take(page && perPage ? perPage : undefined)
      .skip(page && perPage ? (page - 1) * perPage : undefined)
      .orderBy('announcement.creation_date', 'DESC')
      .getMany();

    const total_entries = await appDataSource.manager
      .createQueryBuilder()
      .select('announcement')
      .from(Announcement, 'announcement')
      .getCount();

    await Promise.all(
      data.map(async (announcement) => {
        if (announcement.image)
          announcement.image = await minioClient.presignedGetObject(
            MINIO_BUCKETNAME,
            announcement.image,
            60 * 60 * 24 * 7,
          );
        announcement.announcement_attachments = await Promise.all(
          announcement.announcement_attachments.map(async (attachment) => {
            attachment.attachment_loc = await minioClient.presignedGetObject(
              MINIO_BUCKETNAME,
              attachment.attachment_loc,
              60 * 60 * 24 * 7,
            );
            return attachment;
          }),
        );
      }),
    );

    return { data, total_entries, length_of_page: data.length };
  }
  public static async updateAnnouncement(
    newAnnouncement: Partial<
      Omit<
        Announcement,
        'user' | 'announcement_completions' | 'announcement_attachments' | 'announcement_id'
      > & {
        attachments?: Express.Multer.File[];
      }
    > & { announcement_id: number },
  ) {
    const announcement = await this.getAnnouncement(newAnnouncement.announcement_id);
    if (!announcement) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }
    const updatedAnnouncement = new Announcement();
    updatedAnnouncement.announcement_id = newAnnouncement.announcement_id;
    updatedAnnouncement.creation_date = newAnnouncement.creation_date ?? announcement.creation_date;
    updatedAnnouncement.description = newAnnouncement.description ?? announcement.description;
    updatedAnnouncement.title = newAnnouncement.title ?? announcement.title;

    updatedAnnouncement.username = newAnnouncement.username ?? announcement.username;
    updatedAnnouncement.user = (await UserModel.getUserDetails(
      updatedAnnouncement.username,
    )) as User;

    const deleteOldImage = () => {
      if (announcement.image) {
        return minioClient.removeObject(MINIO_BUCKETNAME, 'announcement/' + announcement.title);
      }
    };

    if (!newAnnouncement.image) {
      // delete old image
      deleteOldImage();
      updatedAnnouncement.image = null;
    } else {
      // rm old image
      deleteOldImage();
      // update image
      const convertedFile = dataUrlToBuffer(newAnnouncement.image);
      if (!convertedFile) {
        throw HTTPErrors.INVALID_DATA_URL;
      }
      await minioClient.putObject(
        MINIO_BUCKETNAME,
        'announcement/' + updatedAnnouncement.title,
        convertedFile.buffer,
        { 'Content-Type': convertedFile.mimetype },
      );
      updatedAnnouncement.image = 'announcement/' + updatedAnnouncement.title;
    }

    const deleteOldAttachments = () => {
      const deleteObjects = new Promise<void>((resolve, reject) => {
        const stream = minioClient.listObjectsV2(
          MINIO_BUCKETNAME,
          'announcement-attachment/' + announcement.title,
        );
        const objects: string[] = [];
        stream.on('data', (obj) => obj.name && objects.push(obj.name));
        stream.on('error', (err) => {
          reject(err);
        });
        stream.on('end', async () => {
          await minioClient.removeObjects(MINIO_BUCKETNAME, objects);
          resolve();
        });
      });
      Promise.resolve(deleteObjects);
    };

    if (!newAnnouncement.attachments) {
      // delete old attachments
      deleteOldAttachments();
      await appDataSource.manager.delete(AnnouncementAttachment, {
        announcement_id: announcement.announcement_id,
      });
    } else {
      // rm old attachments
      deleteOldAttachments();
      await appDataSource.manager.delete(AnnouncementAttachment, {
        announcement_id: announcement.announcement_id,
      });
      // insert new attachments
      const attachments = await Promise.all(
        newAnnouncement.attachments.map(async (attachment, idx) => {
          const newAttachment = new AnnouncementAttachment();

          newAttachment.announcement = updatedAnnouncement;
          newAttachment.attachment_loc =
            'announcement-attachment/' + updatedAnnouncement.title + '-' + idx;

          await minioClient.putObject(
            MINIO_BUCKETNAME,
            newAttachment.attachment_loc,
            attachment.buffer,
            { 'Content-Type': attachment.mimetype },
          );

          newAttachment.attachment_name = attachment.originalname;
          newAttachment.announcement_id = updatedAnnouncement.announcement_id;
          newAttachment.attachment_mime = attachment.mimetype;

          return newAttachment;
        }),
      );
      await appDataSource.manager.insert(AnnouncementAttachment, attachments);
    }

    await appDataSource.manager.update(
      Announcement,
      { announcement_id: announcement.announcement_id },
      updatedAnnouncement,
    );

    return updatedAnnouncement;
  }
  public static async deleteAnnouncement(announcement_id: number) {
    const announcement = await this.getAnnouncement(announcement_id);
    const deleteObjects = new Promise<void>((resolve, reject) => {
      const stream = minioClient.listObjectsV2(
        MINIO_BUCKETNAME,
        'announcement-attachment/' + announcement.title,
      );
      const objects: string[] = [];
      stream.on('data', (obj) => obj.name && objects.push(obj.name));
      stream.on('error', (err) => {
        reject(err);
      });
      stream.on('end', async () => {
        await minioClient.removeObjects(MINIO_BUCKETNAME, objects);
        resolve();
      });
    });
    Promise.resolve(deleteObjects);
    await appDataSource.manager.delete(Announcement, { announcement_id });
  }
  public static async getAnnouncementCompletions(announcement_id: number) {
    const announcement = await this.getAnnouncement(announcement_id);
    if (!announcement) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
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
  public static async updateAnnouncementCompletion(
    announcement_id: number,
    username: string,
    completed: boolean,
  ) {
    const user = await UserModel.getUser(username);
    const announcement = await this.getAnnouncement(announcement_id);
    if (!user || !announcement) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }
    await appDataSource.manager.update(
      AnnouncementCompletion,
      { announcement_id, username },
      { completed, user, announcement },
    );
  }
}
