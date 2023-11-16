import appDataSource from '@utils/init_datasource';
import { User, UserPermission, UserService } from '@db/entities';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

export class AuthModel {
  private static readonly secretKey = new TextEncoder().encode(process.env.JWT_SECRET as string);
  public static async signUp(userId: number, username: string, email: string, password: string) {
    // init a new user
    const user = new User();
    user.user_id = userId;
    user.username = username;
    user.email = email;
    user.service_hours = 0;

    // generate a random salt and hash the password
    // salt is of type bytea in postgres
    user.password_salt = randomBytes(Number(process.env.PASSWORD_SALT_LENGTH)).toString('hex');
    try {
      const password_hash_buffer = pbkdf2Sync(
        password,
        user.password_salt,
        Number(process.env.PASSWORD_HASH_ITERATIONS),
        Number(process.env.PASSWORD_HASH_LENGTH),
        'sha512',
      );
      user.password_hash = password_hash_buffer.toString(
        process.env.PASSWORD_HASH_FMT as BufferEncoding,
      );
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

    // sign a JWT token and return it
    const token = await new SignJWT({
      userId: userId,
      username: username,
      email: email,
      service_hours: 0,
      permissions: [0],
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(process.env.JWT_ISSUER as string)
      .setAudience(process.env.JWT_AUDIENCE as string)
      .setExpirationTime(process.env.JWT_EXPIRATION_TIME as string)
      .sign(this.secretKey);
    return token;
  }
}
