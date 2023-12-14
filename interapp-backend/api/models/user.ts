import appDataSource from '@utils/init_datasource';
import { User, UserPermission, UserService, Service } from '@db/entities';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { randomBytes } from 'crypto';
import redisClient from '@utils/init_redis';
import transporter from '@email_handler/index';
import Mail from 'nodemailer/lib/mailer';

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
  public static async getAllUsers() {
    const users = await appDataSource.manager
      .createQueryBuilder()
      .select([
        'user.username',
        'user.email',
        'user.verified',
        'user.user_id',
        'user.service_hours',
      ])
      .from(User, 'user')
      .getMany();
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
        token: token,
        username: username,
        url: 'localhost:3000', //TODO
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
        url: process.env.FRONTEND_URL as string + '/auth/verify_email?token=' + token,
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
    const users: Partial<User>[] = await appDataSource.manager
      .createQueryBuilder()
      .select(['user'])
      .from(User, 'user')
      .where('user.username IN (:...usernames)', { usernames })
      .getMany();
    users.forEach((user) => {
      delete user.password_hash;
      delete user.refresh_token;
    });
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
}
