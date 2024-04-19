import appDataSource from '@utils/init_datasource';
import {
  User,
  UserPermission,
  UserService,
  Service,
  ServiceSessionUser,
  ServiceSession,
  AnnouncementCompletion,
  AttendanceStatus,
} from '@db/entities';
import { HTTPErrors } from '@utils/errors';
import { randomBytes } from 'crypto';
import redisClient from '@utils/init_redis';
import transporter from '@email_handler/index';
import Mail from 'nodemailer/lib/mailer';
import dataUrlToBuffer from '@utils/dataUrlToBuffer';
import minioClient from '@utils/init_minio';

interface EmailOptions extends Mail.Options {
  template: string;
  context: Record<string, unknown>;
}

type UserWithoutSensitiveFields = Omit<
  User,
  'password_hash' | 'refresh_token' | 'user_permissions' | 'user_services' | 'service_session_users'
>;

const MINIO_BUCKETNAME = process.env.MINIO_BUCKETNAME as string;
export class UserModel {
  public static async getUser(username: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user'])
      .from(User, 'user')
      .where('user.username = :username', { username: username })
      .getOne();
    if (!user) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }
    return user;
  }
  public static async deleteUser(username: string) {
    await appDataSource.manager.delete(User, { username });
  }
  // the following function does not expose sensitive information
  static async getUserDetails(username: string): Promise<UserWithoutSensitiveFields>;
  static async getUserDetails(username?: undefined): Promise<UserWithoutSensitiveFields[]>;

  public static async getUserDetails(
    username?: string,
  ): Promise<UserWithoutSensitiveFields | UserWithoutSensitiveFields[]> {
    const condition = username ? 'user.username = :username' : '1=1';
    const users = await appDataSource.manager
      .createQueryBuilder()
      .select([
        'user.username',
        'user.email',
        'user.verified',
        'user.user_id',
        'user.service_hours',
        'user.profile_picture',
      ])
      .where(condition, { username })
      .from(User, 'user')
      .getMany();

    for (const user of users) {
      if (user.profile_picture) {
        const url = await minioClient.presignedGetObject(MINIO_BUCKETNAME, user.profile_picture);
        user.profile_picture = url;
      }
    }

    if (username) {
      switch (users.length) {
        case 0:
          throw HTTPErrors.RESOURCE_NOT_FOUND;
        case 1:
          return users[0];
        default:
          throw HTTPErrors.DATABASE_CORRUPTED;
      }
    }

    return users;
  }
  public static async changeEmail(username: string, new_email: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user.username', 'user.email'])
      .from(User, 'user')
      .where('user.username = :username', { username: username })
      .getOne();

    if (!user) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }

    user.email = new_email;
    user.verified = false;
    await appDataSource.manager.update(User, { username: username }, user);
  }
  public static async changePassword(username: string, old_password: string, new_password: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user.username', 'user.password_hash'])
      .from(User, 'user')
      .where('user.username = :username', { username: username })
      .getOne();

    if (!user) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }

    if (!(await Bun.password.verify(old_password, user.password_hash))) {
      throw HTTPErrors.INVALID_PASSWORD;
    }

    try {
      user.password_hash = await Bun.password.hash(new_password);
    } catch (err) {
      // err should be of type Error always
      if (err instanceof Error) {
        throw HTTPErrors.FAILED_HASHING_PASSWORD;
      }
    }
    await appDataSource.manager.update(User, { username: username }, user);
  }
  public static async resetPassword(token: string) {
    // check if the user exists in redis
    const username = await redisClient.get(`resetpw:${token}`);
    if (!username) {
      throw HTTPErrors.INVALID_HASH;
    }

    // generate a random password
    const new_password = randomBytes(8).toString('hex');

    // hash the password
    const newPasswordHash = await Bun.password.hash(new_password);

    // update the user's password, and delete the refresh token
    await appDataSource.manager.update(
      User,
      { username: username },
      { password_hash: newPasswordHash, refresh_token: null },
    );

    // delete the token
    await redisClient.del(`resetpw:${token}`);

    return new_password;
  }
  public static async sendResetPasswordEmail(username: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user.email'])
      .from(User, 'user')
      .where('user.username = :username', { username: username })
      .getOne();

    if (!user) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }

    const token = randomBytes(128).toString('hex'); // minimum 128 bytes for security
    await redisClient.set(`resetpw:${token}`, username, {
      EX: 60 * 60 * 1, // 1 hour expiration
    });

    const email: EmailOptions = {
      from: {
        name: 'OneInteract',
        address: process.env.EMAIL_USER as string,
      },
      to: [user.email],
      subject: 'Reset Password from OneInteract',
      template: 'reset_password',
      context: {
        username: username,
        url: (process.env.FRONTEND_URL as string) + '/auth/forgot_password_verify?token=' + token,
      },
    };

    await transporter.sendMail(email);
    return token;
  }
  public static async verifyEmail(token: string) {
    // check if the user exists in redis
    const username = await redisClient.get(`verify:${token}`);
    if (!username) {
      throw HTTPErrors.INVALID_HASH;
    }

    // delete the token
    await redisClient.del(`verify:${token}`);

    // update the user's verified status
    await appDataSource.manager.update(User, { username: username }, { verified: true });

    // get new JWT body
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user.user_id'])
      .from(User, 'user')
      .leftJoinAndSelect('user.user_permissions', 'user_permissions')
      .where('user.username = :username', { username: username })
      .getOne();
    if (!user) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }
  }
  public static async sendVerifyEmail(username: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user.email', 'user.verified'])
      .from(User, 'user')
      .where('user.username = :username', { username: username })
      .getOne();

    if (!user) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }

    if (user.verified) {
      throw HTTPErrors.ALREADY_VERIFIED;
    }

    const token = randomBytes(128).toString('hex'); // minimum 128 bytes for security
    await redisClient.set(`verify:${token}`, username, {
      EX: 60 * 60 * 1, // 1 hour expiration
    });

    const email: EmailOptions = {
      from: {
        name: 'OneInteract',
        address: process.env.EMAIL_USER as string,
      },
      to: [user.email],
      subject: 'Verify Email from OneInteract',
      template: 'verify_email',
      context: {
        username: username,
        url: (process.env.FRONTEND_URL as string) + '/auth/verify_email?token=' + token,
      },
    };

    await transporter.sendMail(email);
    return token;
  }
  public static async checkPermissions(username: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user.user_id', 'user_permissions.permission_id'])
      .from(User, 'user')
      .leftJoinAndSelect('user.user_permissions', 'user_permissions')
      .where('user.username = :username', { username: username })
      .getOne();
    if (!user) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }

    const perms = user.user_permissions.map((perm) => perm.permission_id);

    return perms;
  }
  public static async updatePermissions(username: string, permissions: number[]) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user'])
      .from(User, 'user')
      .leftJoinAndSelect('user.user_permissions', 'user_permissions')
      .where('user.username = :username', { username: username })
      .getOne();
    if (!user) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }
    // delete all permissions
    await appDataSource.manager.delete(UserPermission, { username });
    // add new permissions
    await appDataSource.manager.insert(
      UserPermission,
      permissions.map((perm) => ({ username, permission_id: perm, user })),
    );
  }
  public static async getPermissions(username?: string) {
    const perms = await appDataSource.manager
      .createQueryBuilder()
      .select(['user_permissions'])
      .from(UserPermission, 'user_permissions')
      .where(username ? 'user_permissions.username = :username' : '1=1', { username })
      .getMany();
    if (perms.length === 0) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }
    return perms.reduce(
      (acc, perm) => {
        if (!acc[perm.username]) acc[perm.username] = [];
        acc[perm.username].push(perm.permission_id);
        return acc;
      },
      {} as Record<string, number[]>,
    );
  }
  public static async getAllServicesByUser(username: string) {
    const user_services = await appDataSource
      .createQueryBuilder()
      .select(['user_service.service_id'])
      .from(UserService, 'user_service')
      .where('user_service.username = :username', { username })
      .getMany();
    if (!user_services) {
      throw HTTPErrors.NO_SERVICES_FOUND;
    }
    const service_ids = user_services.map((service) => service.service_id);
    if (service_ids.length === 0) {
      throw HTTPErrors.NO_SERVICES_FOUND;
    }
    return await appDataSource.manager
      .createQueryBuilder()
      .select(['service'])
      .from(Service, 'service')
      .where('service.service_id IN (:...services)', { services: service_ids })
      .getMany();
  }
  public static async getAllServiceSessionsByUser(username: string) {
    type GetAllServiceSessionsByUserResult = Omit<
      ServiceSessionUser,
      'service_session' | 'user'
    > & {
      service_session: Pick<ServiceSession, 'start_time' | 'end_time' | 'service_id'> & {
        service: Pick<Service, 'name' | 'promotional_image'>;
      };
    };

    const serviceSessions: GetAllServiceSessionsByUserResult[] = await appDataSource.manager
      .createQueryBuilder()
      .select(['service_session_user'])
      .from(ServiceSessionUser, 'service_session_user')
      .where('service_session_user.username = :username', { username })
      .leftJoin('service_session_user.service_session', 'service_session')
      .addSelect([
        'service_session.service_id',
        'service_session.start_time',
        'service_session.end_time',
      ])
      .leftJoin('service_session.service', 'service')
      .addSelect(['service.name', 'service.promotional_image'])
      .orderBy('service_session.start_time', 'DESC')
      .getMany();

    if (!serviceSessions) {
      throw HTTPErrors.NO_SERVICE_SESSION_FOUND;
    }

    for (const session of serviceSessions) {
      if (session.service_session.service.promotional_image) {
        const url = await minioClient.presignedGetObject(
          MINIO_BUCKETNAME,
          session.service_session.service.promotional_image,
        );
        session.service_session.service.promotional_image = url;
      }
    }
    let parsed: {
      service_id: number;
      start_time: string;
      end_time: string;
      name: string;
      promotional_image?: string | null;
      service_session_id: number;
      username: string;
      ad_hoc: boolean;
      attended: string;
      is_ic: boolean;
      service_session?: any;
    }[] = serviceSessions.map((session) => ({
      ...session,
      service_id: session.service_session.service_id,
      start_time: session.service_session.start_time,
      end_time: session.service_session.end_time,
      name: session.service_session.service.name,
      promotional_image: session.service_session.service.promotional_image,
    }));

    for (const sess of parsed) {
      delete sess.service_session;
    }

    return parsed;
  }
  public static async getAllUsersByService(service_id: number) {
    const service_users = await appDataSource
      .createQueryBuilder()
      .select(['user_service.username'])
      .from(UserService, 'user_service')
      .where('user_service.service_id = :service_id', { service_id })
      .getMany();
    if (!service_users) {
      throw HTTPErrors.SERVICE_NO_USER_FOUND;
    }
    const usernames = service_users.map((service) => service.username);
    if (usernames.length === 0) {
      throw HTTPErrors.SERVICE_NO_USER_FOUND;
    }
    const users: Pick<User, 'username' | 'user_id' | 'email' | 'verified' | 'service_hours'>[] =
      await appDataSource.manager
        .createQueryBuilder()
        .select([
          'user.username',
          'user.user_id',
          'user.email',
          'user.verified',
          'user.service_hours',
        ])
        .from(User, 'user')
        .where('user.username IN (:...usernames)', { usernames })
        .getMany();

    return users;
  }
  public static async addServiceUser(service_id: number, username: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user'])
      .from(User, 'user')
      .where('user.username = :username', { username })
      .getOne();
    if (!user) throw HTTPErrors.RESOURCE_NOT_FOUND;
    const service = await appDataSource.manager
      .createQueryBuilder()
      .select(['service'])
      .from(Service, 'service')
      .where('service.service_id = :service_id', { service_id })
      .getOne();
    if (!service) throw HTTPErrors.RESOURCE_NOT_FOUND;
    try {
      await appDataSource.manager.insert(UserService, { service_id, username, user, service });
    } catch (e) {
      throw HTTPErrors.ALREADY_PART_OF_SERVICE;
    }
  }
  public static async removeServiceUser(service_id: number, username: string) {
    await appDataSource.manager.delete(UserService, { service_id, username });
  }
  public static async updateServiceUserBulk(
    service_id: number,
    data: { action: 'add' | 'remove'; username: string }[],
  ) {
    const service = await appDataSource.manager
      .createQueryBuilder()
      .select(['service'])
      .from(Service, 'service')
      .where('service.service_id = :service_id', { service_id })
      .getOne();
    if (!service) throw HTTPErrors.RESOURCE_NOT_FOUND;

    const findUsers = async (usernames: string[]) => {
      if (findUsers.length === 0) return [];
      return await appDataSource.manager
        .createQueryBuilder()
        .select(['user'])
        .from(User, 'user')
        .where('user.username IN (:...usernames)', { usernames })
        .getMany();
    };

    const toAdd = data
      .filter(({ action, username }) => action === 'add')
      .map((data) => data.username);
    const toRemove = data
      .filter(({ action, username }) => action === 'remove')
      .map((data) => data.username);

    if (toAdd.length !== 0)
      await appDataSource.manager.insert(
        UserService,
        (await findUsers(toAdd)).map((user) => ({
          service_id,
          username: user.username,
          service,
          user,
        })),
      );
    if (toRemove.length !== 0)
      await appDataSource.manager.delete(
        UserService,
        toRemove.map((username) => ({ service_id, username })),
      );
  }
  public static async updateServiceHours(username: string, hours: number) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user'])
      .from(User, 'user')
      .where('user.username = :username', { username })
      .getOne();
    if (!user) throw HTTPErrors.RESOURCE_NOT_FOUND;
    user.service_hours = hours;
    await appDataSource.manager.update(User, { username }, user);
  }
  // this method is fundamentally different from the previous one
  // it ADDS a certain number of hours to the user's service hours, and does not set it to a specific value like the previous one
  public static async updateServiceHoursBulk(data: { username: string; hours: number }[]) {
    const queryRunner = appDataSource.createQueryRunner();
  
    // start a new transaction
    await queryRunner.startTransaction();
  
    try {
      await Promise.all(
        data.map(async ({ username, hours }) => {
          const user = await queryRunner.manager
            .createQueryBuilder()
            .select(['user'])
            .from(User, 'user')
            .where('user.username = :username', { username })
            .getOne();
  
          if (!user) throw HTTPErrors.RESOURCE_NOT_FOUND;
  
          user.service_hours += hours;
          await queryRunner.manager.update(User, { username }, user);
        }),
      );
  
      // commit the transaction if no errors were thrown
      await queryRunner.commitTransaction();
    } catch (error) {
      // rollback the transaction if an error was thrown
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // release the query runner
      await queryRunner.release();
    }
  }
  public static async updateProfilePicture(username: string, profile_picture: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user'])
      .from(User, 'user')
      .where('user.username = :username', { username })
      .getOne();
    if (!user) throw HTTPErrors.RESOURCE_NOT_FOUND;
    const converted = dataUrlToBuffer(profile_picture);

    if (!converted) throw HTTPErrors.INVALID_DATA_URL;
    await minioClient.putObject(
      MINIO_BUCKETNAME,
      `profile_pictures/${username}`,
      converted.buffer,
      { 'Content-Type': converted.mimetype },
    );
    user.profile_picture = `profile_pictures/${username}`;

    await appDataSource.manager.update(User, { username }, user);
  }
  public static async deleteProfilePicture(username: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user'])
      .from(User, 'user')
      .where('user.username = :username', { username })
      .getOne();
    if (!user) throw HTTPErrors.RESOURCE_NOT_FOUND;

    await minioClient.removeObject(MINIO_BUCKETNAME, `profile_pictures/${username}`);
    user.profile_picture = null;

    await appDataSource.manager.update(User, { username }, user);
  }
  public static async getNotifications(username: string) {
    const isVerified = (
      await appDataSource.manager
        .createQueryBuilder()
        .select(['user.verified'])
        .from(User, 'user')
        .where('user.username = :username', { username })
        .getOne()
    )?.verified;

    if (isVerified === undefined) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }

    const unreadAnnouncements: {
      announcement_id: number;
      announcement: {
        title: string;
        description: string;
        creation_date: string;
      };
    }[] = await appDataSource.manager
      .createQueryBuilder()
      .select(['announcement_completion.announcement_id'])
      .from(AnnouncementCompletion, 'announcement_completion')
      .where('announcement_completion.username = :username', { username })
      .andWhere('announcement_completion.completed = false')
      .leftJoin('announcement_completion.announcement', 'announcement')
      .addSelect(['announcement.title', 'announcement.description', 'announcement.creation_date'])
      .getMany();

    let activeSessions: {
      service_session_id: number;
      service_session: {
        start_time: string;
        end_time: string;
        service: {
          name: string;
        };
      };
    }[] = await appDataSource.manager
      .createQueryBuilder()
      .select(['service_session_user'])
      .from(ServiceSessionUser, 'service_session_user')
      .where('service_session_user.username = :username', { username })
      .andWhere('service_session_user.attended IN (:...attended)', {
        attended: [AttendanceStatus.Absent, AttendanceStatus.ValidReason],
      })
      .leftJoin('service_session_user.service_session', 'service_session')
      .addSelect(['service_session.start_time', 'service_session.end_time'])
      .leftJoin('service_session.service', 'service')
      .addSelect(['service.name'])
      .getMany();

    activeSessions = activeSessions.filter((session) => {
      const sessionStartTime = new Date(session.service_session.start_time);
      const sessionEndTime = new Date(session.service_session.end_time);
      const now = new Date();
      return sessionStartTime <= now && now <= sessionEndTime;
    });

    const returnData = {
      unread_announcements: unreadAnnouncements,
      active_sessions: activeSessions,
      verified: isVerified,
    };
    return returnData;
  }
}
