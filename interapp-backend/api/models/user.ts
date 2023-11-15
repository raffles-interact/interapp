import appDataSource from '@utils/init_datasource';
import { User, UserPermission, UserService } from '@db/entities';
import { HTTPError, HTTPErrorCode } from '@utils/errors';

export class UserModel {
  public static async getUserMetadata(userId: number) {
    const userMeta = await appDataSource
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .innerJoinAndSelect('user.user_permissions', 'user_permissions')
      .innerJoinAndSelect('user.user_service', 'user_service')
      .where('user.user_id = :id', { id: userId })
      .getOne();

    if (!userMeta) {
      throw new HTTPError(
        'User not found',
        `The user with id ${userId} was not found in the database`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    return userMeta;
  }
}
