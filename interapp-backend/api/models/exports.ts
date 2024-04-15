import appDataSource from '@utils/init_datasource';
import { ServiceSession, AttendanceStatus } from '@db/entities';
import xlsx, { type WorkSheet } from 'node-xlsx';

// hardcoded constants, update as needed
// refers to the LIKE (:name) in the query
const CONFIG = {
  GM_NAME: '%general meeting%',
  MENTORSHIP_NAME: 'mentorship%',
};

type GetExportsResult = {
  service_session_id: number;
  start_time: string;
  end_time: string;
  service: {
    name: string;
  };
  service_session_users: {
    service_session_id: number;
    username: string;
    ad_hoc: boolean;
    attended: AttendanceStatus;
    is_ic: boolean;
  }[];
};

type GeneralMeetingXLSX = [
  ['username', ...string[]],
  ...[string, ...(AttendanceStatus | null)[]][],
];

export class ExportsModel {
  private static async getExports(name: string) {
    const res: GetExportsResult[] = await appDataSource.manager
      .createQueryBuilder()
      .select([
        'service_session.service_session_id',
        'service_session.start_time',
        'service_session.end_time',
        'service.name',
      ])
      .from(ServiceSession, 'service_session')
      .leftJoin('service_session.service', 'service')
      .where('LOWER(service.name) LIKE :name', { name })
      .leftJoinAndSelect('service_session.service_session_users', 'service_session_users')
      .orderBy('service_session.start_time', 'ASC')
      .getMany();
    return res;
  }

  public static async getGMExports() {
    const ret = await this.getExports(CONFIG.GM_NAME);

    // create headers
    // start_time is in ascending order
    const headers: GeneralMeetingXLSX[0] = (['username'] as GeneralMeetingXLSX[0]).concat(
      ret.map(({ start_time }) => start_time),
    ) as GeneralMeetingXLSX[0];

    // output needs to be in the form:
    // [username, [attendance status for each general meeting]]

    // get all unique usernames
    const usernames = new Set<string>();
    ret.forEach(({ service_session_users }) => {
      service_session_users.forEach(({ username }) => {
        usernames.add(username);
      });
    });

    // transform set to {[username]: [attendance status for each general meeting]}
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

    const body: GeneralMeetingXLSX[1][] = Object.entries(usernameMap).map(
      ([username, attendance]) => [username, ...attendance],
    );

    const out: GeneralMeetingXLSX = [headers, ...body];

    const sheetOptions = { '!cols': [{ wch: 20 }, ...Array(ret.length).fill({ wch: 12 })] };
    const built = xlsx.build([{ name: 'General Meetings', data: out, options: sheetOptions }]);

    return built;
  }
  public static async getMentorshipExports() {
    return await this.getExports(CONFIG.MENTORSHIP_NAME);
  }
}
