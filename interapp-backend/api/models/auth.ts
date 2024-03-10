import appDataSource from '@utils/init_datasource';
import { User, UserPermission } from '@db/entities';
import { HTTPErrors } from '@utils/errors';
import { SignJWT, jwtVerify, JWTPayload, JWTVerifyResult } from 'jose';

import redisClient from '@utils/init_redis';

export interface UserJWT {
  user_id: number;
  username: string;
}

type JWTtype = 'access' | 'refresh';

export class AuthModel {
  private static readonly accessSecret = new TextEncoder().encode(
    process.env.JWT_ACCESS_SECRET as string,
  );
  private static readonly refreshSecret = new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET as string,
  );
  private static async signJWT(jwtBody: UserJWT, type: JWTtype = 'access') {
    const jwt: UserJWT & JWTPayload = { ...jwtBody }; // copy the object and cast it to JWTPayload

    const expireTime =
      Date.now() +
      (type === 'access'
        ? Number(process.env.JWT_ACCESS_EXPIRATION as string)
        : Number(process.env.JWT_REFRESH_EXPIRATION as string));

    const token = await new SignJWT(jwt)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(process.env.JWT_ISSUER as string)
      .setAudience(process.env.JWT_AUDIENCE as string)
      .setExpirationTime(expireTime)
      .sign(type === 'access' ? this.accessSecret : this.refreshSecret);

    return { token, expire: expireTime };
  }
  public static async signUp(user_id: number, username: string, email: string, password: string) {
    // init a new user
    const user = new User();
    user.user_id = user_id;
    user.username = username;
    user.email = email;
    user.service_hours = 0;
    user.verified = false;
    user.profile_picture = null;

    try {
      user.password_hash = await Bun.password.hash(password);
    } catch (err) {
      throw HTTPErrors.FAILED_HASHING_PASSWORD;
    }

    try {
      // if the user already exists, throw an error
      await appDataSource.manager.insert(User, user);
    } catch (err) {
      throw HTTPErrors.ALREADY_EXISTS;
    }

    // init a new permission entry for the user, will insert/update regardless if this entry already exists
    const userPermission = new UserPermission();
    userPermission.user = user;
    userPermission.username = username;
    userPermission.permission_id = 0;

    await appDataSource.manager.save(userPermission);
  }
  public static async signIn(username: string, password: string) {
    const user = await appDataSource.manager
      .createQueryBuilder()
      .select([
        'user.user_id',
        'user.password_hash',
        'user.username',
        'user.email',
        'user.verified',
        'user.service_hours',
      ])
      .from(User, 'user')
      .leftJoinAndSelect('user.user_permissions', 'user_permissions')
      .where('user.username = :username', { username: username })
      .getOne();

    if (!user) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }
    if (!(await Bun.password.verify(password, user.password_hash))) {
      throw HTTPErrors.INVALID_PASSWORD;
    }

    const JWTBody: UserJWT = {
      user_id: user.user_id,
      username: username,
    };

    // sign a JWT token and return it
    const { token, expire } = await this.signJWT(JWTBody, 'access');
    const refresh = (await this.signJWT(JWTBody, 'refresh')).token;

    await appDataSource.manager.update(User, { username: username }, { refresh_token: refresh });

    const parsedUser = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      verified: user.verified,
      service_hours: user.service_hours,
      permissions: user.user_permissions.map((perm) => perm.permission_id),
    };

    return { token: token, refresh: refresh, expire: expire, user: parsedUser };
  }
  public static async signOut(username: string, accessToken: string) {
    await appDataSource.manager.update(User, { username: username }, { refresh_token: null });
    await redisClient.set(`blacklist:${accessToken}`, 'true', { EX: 60 * 60 * 24 });
  }
  public static async getNewAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw HTTPErrors.INVALID_REFRESH_TOKEN;
    }

    const result = await this.verify(refreshToken, 'refresh');
    const username = result.payload.username;

    if (!username) {
      throw HTTPErrors.INVALID_REFRESH_TOKEN;
    }

    const user = await appDataSource.manager
      .createQueryBuilder()
      .select(['user.refresh_token'])
      .from(User, 'user')
      .where('user.username = :username', { username: username })
      .getOne();
    if (!user) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }

    if (user.refresh_token !== refreshToken) {
      throw HTTPErrors.INVALID_REFRESH_TOKEN;
    }

    // passed all checks, sign a new access token and return it
    const JWTBody: UserJWT = {
      user_id: result.payload.user_id,
      username: username,
    };

    const { token, expire } = await this.signJWT(JWTBody, 'access');
    const refresh = (await this.signJWT(JWTBody, 'refresh')).token;

    await appDataSource.manager.update(User, { username: username }, { refresh_token: refresh });

    return { token: token, refresh: refresh, expire: expire };
  }

  public static async verify(token: string, type: JWTtype = 'access') {
    try {
      // check if the token is blacklisted
      const blacklisted = await redisClient.get(`blacklist:${token}`);

      if (blacklisted) {
        throw HTTPErrors.INVALID_ACCESS_TOKEN;
      }
      const payload: JWTVerifyResult<JWTPayload & UserJWT> = await jwtVerify(
        token,
        type === 'access' ? this.accessSecret : this.refreshSecret,
      );
      return payload;
    } catch (err) {
      throw HTTPErrors.INVALID_ACCESS_TOKEN;
    }
  }
}
