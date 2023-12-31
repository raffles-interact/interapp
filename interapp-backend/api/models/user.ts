import appDataSource from '@utils/init_datasource';
import {
  User,
  UserPermission,
  UserService,
  Service,
  ServiceSessionUser,
  ServiceSession,
} from '@db/entities';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
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

export class UserModel {
  public static async getUser(username: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user'])
      .from(User, 'user')
      .where('user.username = :username', { username: username })
      .getOne();
    if (!user) {
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    return user;
  }
  public static async deleteUser(username: string) {
    await appDataSource.manager.delete(User, { username });
  }
  // the following function does not expose sensitive information
  public static async getUserDetails(username?: string) {
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
        const url = await minioClient.presignedGetObject(
          process.env.MINIO_BUCKETNAME as string,
          user.profile_picture,
        );
        user.profile_picture = url;
      }
    }

    if (username) {
      switch (users.length) {
        case 0:
          throw new HTTPError(
            'User not found',
            `The user with username ${username} was not found in the database`,
            HTTPErrorCode.NOT_FOUND_ERROR,
          );
        case 1:
          return users[0] as Omit<
            User,
            | 'password_hash'
            | 'refresh_token'
            | 'user_permissions'
            | 'user_services'
            | 'service_session_users'
          >;
        default:
          throw new HTTPError(
            'Multiple users found',
            `Multiple users with username ${username} were found in the database`,
            HTTPErrorCode.INTERNAL_SERVER_ERROR,
          );
      }
    }

    return users as Omit<
      User,
      | 'password_hash'
      | 'refresh_token'
      | 'user_permissions'
      | 'user_services'
      | 'service_session_users'
    >[];
  }
  public static async changeEmail(username: string, new_email: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user.username', 'user.email'])
      .from(User, 'user')
      .where('user.username = :username', { username: username })
      .getOne();

    if (!user) {
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
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
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }

    if (!(await Bun.password.verify(old_password, user.password_hash))) {
      throw new HTTPError(
        'Invalid password',
        'The old password you entered is incorrect',
        HTTPErrorCode.UNAUTHORIZED_ERROR,
      );
    }

    try {
      user.password_hash = await Bun.password.hash(new_password);
    } catch (err) {
      // err should be of type Error always
      if (err instanceof Error) {
        throw new HTTPError(
          'Password hashing error',
          err.message || 'An error occurred while hashing the password',
          HTTPErrorCode.INTERNAL_SERVER_ERROR,
        );
      }
    }
    await appDataSource.manager.update(User, { username: username }, user);
  }
  public static async resetPassword(token: string) {
    // check if the user exists in redis
    const username = await redisClient.get(`resetpw:${token}`);
    if (!username) {
      throw new HTTPError(
        'Invalid token',
        'The token you provided is invalid',
        HTTPErrorCode.UNAUTHORIZED_ERROR,
      );
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
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }

    const token = randomBytes(128).toString('hex'); // minimum 128 bytes for security
    await redisClient.set(`resetpw:${token}`, username, {
      EX: 60 * 60 * 1, // 1 hour expiration
    });

    const email: EmailOptions = {
      from: {
        name: 'Interapp',
        address: process.env.EMAIL_USER as string,
      },
      to: [user.email],
      subject: 'Reset Password from Interapp',
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
      throw new HTTPError(
        'Invalid token',
        'The token you provided is invalid',
        HTTPErrorCode.UNAUTHORIZED_ERROR,
      );
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
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
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
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }

    if (user.verified) {
      throw new HTTPError(
        'User already verified',
        'The user has already been verified',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

    const token = randomBytes(128).toString('hex'); // minimum 128 bytes for security
    await redisClient.set(`verify:${token}`, username, {
      EX: 60 * 60 * 1, // 1 hour expiration
    });

    const email: EmailOptions = {
      from: {
        name: 'Interapp',
        address: process.env.EMAIL_USER as string,
      },
      to: [user.email],
      subject: 'Verify Email from Interapp',
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
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
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
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
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
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
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
      throw new HTTPError(
        'User not found',
        `The user with username ${username} has no services`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    const service_ids = user_services.map((service) => service.service_id);
    if (service_ids.length === 0) {
      throw new HTTPError(
        'Service not found',
        `The user with username ${username} has no services`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    return await appDataSource.manager
      .createQueryBuilder()
      .select(['service'])
      .from(Service, 'service')
      .where('service.service_id IN (:...services)', { services: service_ids })
      .getMany();
  }
  public static async getAllServiceSessionsByUser(username: string) {
    type getAllServiceSessionsByUserResult = Omit<ServiceSessionUser, 'service_session' | 'user'> &
      {service_session: Pick<ServiceSession, 'start_time' | 'end_time' | 'service_id'> & {service: Pick<Service, 'name' | 'promotional_image'>}};
      
    const serviceSessions = (await appDataSource.manager
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
      .getMany()) as unknown as getAllServiceSessionsByUserResult[];

    if (!serviceSessions) {
      throw new HTTPError(
        'User not found',
        `The user with username ${username} has no service sessions`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }

    for (const session of serviceSessions) {
      if (session.service_session.service.promotional_image) {
        const url = await minioClient.presignedGetObject(
          process.env.MINIO_BUCKETNAME as string,
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
      throw new HTTPError(
        'Service not found',
        `The service with service_id ${service_id} has no users`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    const usernames = service_users.map((service) => service.username);
    if (usernames.length === 0) {
      throw new HTTPError(
        'Service not found',
        `The service with service_id ${service_id} has no users`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
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
    if (!user)
      throw new HTTPError(
        'User not found',
        `User with username ${user} was not found`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    const service = await appDataSource.manager
      .createQueryBuilder()
      .select(['service'])
      .from(Service, 'service')
      .where('service.service_id = :service_id', { service_id })
      .getOne();
    if (!service)
      throw new HTTPError(
        'Service not found',
        `Service with id ${service_id} was not found`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    try {
      await appDataSource.manager.insert(UserService, { service_id, username, user, service });
    } catch (e) {
      throw new HTTPError(
        'Already exists',
        'User already has been added to this service',
        HTTPErrorCode.CONFLICT_ERROR,
      );
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
    if (!service)
      throw new HTTPError(
        'Service not found',
        `Service with id ${service_id} was not found`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );

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
    if (!user)
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    user.service_hours = hours;
    await appDataSource.manager.update(User, { username }, user);
  }
  public static async updateProfilePicture(username: string, profile_picture: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user'])
      .from(User, 'user')
      .where('user.username = :username', { username })
      .getOne();
    if (!user)
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    const converted = dataUrlToBuffer(profile_picture);

    if (!converted)
      throw new HTTPError(
        'Invalid image',
        'The image you provided is invalid',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    await minioClient.putObject(
      process.env.MINIO_BUCKETNAME as string,
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
    if (!user)
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );

    await minioClient.removeObject(
      process.env.MINIO_BUCKETNAME as string,
      `profile_pictures/${username}`,
    );
    user.profile_picture = null;

    await appDataSource.manager.update(User, { username }, user);
  }
}
