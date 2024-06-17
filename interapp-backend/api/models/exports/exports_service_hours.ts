import {
  type ServiceHoursExportResult,
  type ServiceHoursExportsXLSX,
  type ServiceHoursQueryExportsConditions,
  ExportsModelImpl,
  staticImplements,
} from './types';
import { BaseExportsModel } from './exports_base';
import { User } from '@db/entities';
import { HTTPErrors } from '@utils/errors';
import appDataSource from '@utils/init_datasource';

@staticImplements<ExportsModelImpl>()
export class ServiceHoursExportsModel extends BaseExportsModel {
  public static async queryExports({ type, order }: ServiceHoursQueryExportsConditions) {
    const result: ServiceHoursExportResult[] = await appDataSource.manager
      .createQueryBuilder()
      .select(['user.user_id', 'user.username', 'user.service_hours'])
      .from(User, 'user')
      .orderBy(`user.${type}`, order)
      .getMany();
    return result;
  }
  public static async formatXLSX(conds: ServiceHoursQueryExportsConditions) {
    const ret = await this.queryExports(conds);

    if (ret.length === 0) throw HTTPErrors.RESOURCE_NOT_FOUND;

    const data: ServiceHoursExportsXLSX = [
      ['user_id', 'username', 'service_hours'],
      ...ret.map(
        (r) => [r.user_id, r.username, r.service_hours] satisfies ServiceHoursExportsXLSX[1],
      ),
    ];

    const sheetOptions = this.getSheetOptions(data);

    return { name: 'service hours', data, options: sheetOptions };
  }
  public static async packXLSX(
    type: ServiceHoursQueryExportsConditions['type'],
    order: ServiceHoursQueryExportsConditions['order'],
  ) {
    const worksheet = await this.formatXLSX({ type, order });

    return this.constructXLSX(worksheet);
  }
}
