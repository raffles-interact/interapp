import appDataSource from '@utils/init_datasource';
import { User, UserPermission } from '@db/entities';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

export interface UserJWT extends JWTPayload {
  userId: number;
  username: string;
  email: string;
  service_hours: number;
  permissions: number[];
  services: number[];
}

export class AuthModel {
  private static readonly secretKey = new TextEncoder().encode(process.env.JWT_SECRET as string);
  public static async signUp(userId: number, username: string, email: string, password: string) {
    // init a new user
    const user = new User();
    user.user_id = userId;
    user.username = username;
    user.email = email;
    user.service_hours = 0;

    try {
      user.password_hash = await Bun.password.hash(password);
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

    try {
      // if the user already exists, throw an error
      await appDataSource.manager.insert(User, user);
    } catch (err) {
      throw new HTTPError(
        'User already exists',
        `The user with id ${userId} already exists in the database`,
        HTTPErrorCode.CONFLICT_ERROR,
      );
    }

    // init a new permission entry for the user, will insert/update regardless if this entry already exists
    const userPermission = new UserPermission();

    userPermission.user = user;
    userPermission.user_id = userId;
    userPermission.permission_id = 0;

    await appDataSource.manager.save(userPermission);

    const JWTBody: UserJWT = {
      userId: userId,
      username: username,
      email: email,
      service_hours: 0,
      permissions: [0],
      services: [],
    };

    // sign a JWT token and return it
    const token = await new SignJWT(JWTBody)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(process.env.JWT_ISSUER as string)
      .setAudience(process.env.JWT_AUDIENCE as string)
      .setExpirationTime(process.env.JWT_EXPIRATION_TIME as string)
      .sign(this.secretKey);
    return token;
  }
  public static async signIn(username: string, password: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .leftJoinAndSelect('user.user_permissions', 'user_permissions')
      .leftJoinAndSelect('user.user_service', 'user_service')
      .where('user.username = :username', { username: username })
      .getOne();

    if (!user) {
      throw new HTTPError(
        'User not found',
        `The user with username ${username} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }

    if (!(await Bun.password.verify(password, user.password_hash))) {
      throw new HTTPError(
        'Invalid password',
        'The password you entered is incorrect',
        HTTPErrorCode.UNAUTHORIZED_ERROR,
      );
    }

    const JWTBody: UserJWT = {
      userId: user.user_id,
      username: username,
      email: user.email,
      service_hours: user.service_hours,
      permissions: user.user_permissions.map((permission) => permission.permission_id),
      services: user.user_service.map((service) => service.service_id),
    };

    // sign a JWT token and return it
    const token = await new SignJWT(JWTBody)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(process.env.JWT_ISSUER as string)
      .setAudience(process.env.JWT_AUDIENCE as string)
      .setExpirationTime(process.env.JWT_EXPIRATION_TIME as string)
      .sign(this.secretKey);
    return token;
  }
  public static async verify(token: string) {
    try {
      const payload = await jwtVerify(token, this.secretKey);
      return payload;
    } catch (err) {
      throw new HTTPError(
        'Invalid JWT',
        'The JWT you provided is invalid',
        HTTPErrorCode.UNAUTHORIZED_ERROR,
      );
    }
  }
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
  }
}
