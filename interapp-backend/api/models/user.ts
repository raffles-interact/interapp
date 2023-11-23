import appDataSource from '@utils/init_datasource';
import { User, UserPermission, UserService } from '@db/entities';
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
  public static async changePassword(username: string, oldPassword: string, newPassword: string) {
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

    if (!(await Bun.password.verify(oldPassword, user.password_hash))) {
      throw new HTTPError(
        'Invalid password',
        'The old password you entered is incorrect',
        HTTPErrorCode.UNAUTHORIZED_ERROR,
      );
    }

    try {
      user.password_hash = await Bun.password.hash(newPassword);
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
    return;
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
    const newPassword = randomBytes(8).toString('hex');

    // hash the password
    const newPasswordHash = await Bun.password.hash(newPassword);

    // update the user's password, and delete the refresh token
    await appDataSource.manager.update(
      User,
      { username: username },
      { password_hash: newPasswordHash, refresh_token: null },
    );

    // delete the token
    await redisClient.del(`resetpw:${token}`);

    return newPassword;
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

    return;
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
        token: token,
        username: username,
        url: 'localhost:3000', //TODO
      },
    };

    await transporter.sendMail(email);
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
}
