import appDataSource from '@utils/init_datasource';
import { ServiceSession, AttendanceStatus } from '@db/entities';
import xlsx, { WorkSheet } from 'node-xlsx';
import { HTTPErrors } from '@utils/errors';

type ExportsResult = {
  service_session_id: number;
  start_time: string;
  end_time: string;
  service: {
    name: string;
    service_id: number;
  };
  service_session_users: {
    service_session_id: number;
    username: string;
    ad_hoc: boolean;
    attended: AttendanceStatus;
    is_ic: boolean;
  }[];
};

type ExportsXLSX = [['username', ...string[]], ...[string, ...(AttendanceStatus | null)[]][]];

type QueryExportsConditions = {
  id: number;
} & (
  | {
      start_date: string; // ISO strings, we have already validated this
      end_date: string;
    }
  | {
      start_date?: never;
      end_date?: never;
    }
);

export class ExportsModel {
  private static getSheetOptions = (ret: ExportsXLSX) => ({
    '!cols': [{ wch: 24 }, ...Array(ret.length).fill({ wch: 16 })],
  });
  private static constructXLSX = (...data: Parameters<typeof xlsx.build>[0]) => xlsx.build(data);

  public static async queryExports({ id, start_date, end_date }: QueryExportsConditions) {
    let res: ExportsResult[];
    if (start_date === undefined || end_date === undefined) {
      res = await appDataSource.manager
        .createQueryBuilder()
        .select([
          'service_session.service_session_id',
          'service_session.start_time',
          'service_session.end_time',
          'service.name',
          'service.service_id',
        ])
        .from(ServiceSession, 'service_session')
        .leftJoin('service_session.service', 'service')
        .where('service.service_id = :id', { id })
        .leftJoinAndSelect('service_session.service_session_users', 'service_session_users')
        .orderBy('service_session.start_time', 'ASC')
        .getMany();
    } else {
      res = await appDataSource.manager
        .createQueryBuilder()
        .select([
          'service_session.service_session_id',
          'service_session.start_time',
          'service_session.end_time',
          'service.name',
          'service.service_id',
        ])
        .from(ServiceSession, 'service_session')
        .leftJoin('service_session.service', 'service')
        .where('service.service_id = :id', { id })
        .andWhere('service_session.start_time >= :start_date', { start_date })
        .andWhere('service_session.end_time <= :end_date', { end_date })
        .leftJoinAndSelect('service_session.service_session_users', 'service_session_users')
        .orderBy('service_session.start_time', 'ASC')
        .getMany();
    }

    return res;
  }

  public static async formatXLSX(conds: QueryExportsConditions) {
    const ret = await this.queryExports(conds);

    if (ret.length === 0) throw HTTPErrors.RESOURCE_NOT_FOUND;

    // create headers
    // start_time is in ascending order
    const headers: ExportsXLSX[0] = (['username'] as ExportsXLSX[0]).concat(
      ret.map(({ start_time }) => start_time),
    ) as ExportsXLSX[0];

    // output needs to be in the form:
    // [username, [attendance status]]

    // get all unique usernames
    const usernames = new Set<string>();
    ret.forEach(({ service_session_users }) => {
      service_session_users.forEach(({ username }) => {
        usernames.add(username);
      });
    });

    // transform set to {[username]: [attendance status]}
    const usernameMap: Record<string, (AttendanceStatus | null)[]> = {};
    usernames.forEach((username) => {
      usernameMap[username] = [];
    });

    // create body
    ret.forEach(({ service_session_users }) => {
      usernames.forEach((username) => {
        const user = service_session_users.find((user) => user.username === username);
        usernameMap[username].push(user ? user.attended : null);
      });
    });

    const body: ExportsXLSX[1][] = Object.entries(usernameMap).map(([username, attendance]) => [
      username,
      ...attendance,
    ]);

    const out: ExportsXLSX = [headers, ...body];

    const sheetOptions = this.getSheetOptions(out);
    console.log(sheetOptions);

    return { name: ret[0].service.name, data: out, options: sheetOptions };
  }

  public static async packXLSX(ids: number[], start_date?: string, end_date?: string) {
    const data: WorkSheet[] = await Promise.all(
      ids.map((id) => {
        if (start_date === undefined || end_date === undefined) return this.formatXLSX({ id });
        return this.formatXLSX({ id, start_date, end_date });
      }),
    );
    return this.constructXLSX(...data);
  }
}
