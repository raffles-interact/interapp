import { runSuite, testSuites } from '../constants.test';
import { AuthModel, ServiceHoursExportsModel, ServiceModel } from '@models/.';
import { AttendanceStatus } from '@db/entities';
import { expect } from 'bun:test';
import { recreateDB } from '../utils';

const SUITE_NAME = 'ServiceHoursExportsModel';
const suite = testSuites[SUITE_NAME];

const populateDb = async () => {
  const signUp = async (id: number, username: string) =>
    await AuthModel.signUp(id, username, 'test@email.com', 'pass');

  const createService = async (name?: string, service_ic_username?: string) =>
    await ServiceModel.createService({
      name: name ?? 'test service',
      description: 'test description',
      contact_email: 'fkjsf@fjsdakfjsa',
      day_of_week: 1,
      start_time: '10:00',
      end_time: '11:00',
      service_ic_username: service_ic_username ?? 'user',
      service_hours: 1,
      enable_scheduled: true,
    });

  const createSessions = async (service_id: number, start_time: Date, end_time: Date) =>
    await ServiceModel.createServiceSession({
      service_id,
      start_time: start_time.toISOString(),
      end_time: end_time.toISOString(),
      ad_hoc_enabled: false,
      service_hours: 0,
    });

  interface _ServiceSessionUserParams {
    service_session_id: number;
    username: string;
    attended: AttendanceStatus;
  }

  const createSessionUsers = async (users: _ServiceSessionUserParams[]) =>
    await ServiceModel.createServiceSessionUsers(
      users.map((user) => ({ ...user, ad_hoc: false, is_ic: true })),
    );

  // create users
  for (let i = 0; i < 10; i++) {
    await signUp(i, `user${i}`);
  }

  // create service with id 1
  const id = await createService('a', 'user0');

  // create sessions with id 1-10
  for (let i = 0; i < 10; i++) {
    // create sessions with start time now + i days
    const now = new Date();
    now.setDate(now.getDate() + i);

    const end = new Date(now);
    end.setHours(now.getHours() + i);

    await createSessions(id, now, end);
  }

  // add all users to all sessions
  const users = [];
  for (let i = 0; i < 10; i++) {
    // service_session_id is 1-indexed (1-10)
    const serviceSessionId = i + 1;
    for (let j = 0; j < 10; j++) {
      users.push({
        service_session_id: serviceSessionId,
        username: `user${j}`,
        attended: AttendanceStatus.Absent,
      });
    }
  }

  await createSessionUsers(users);
};

suite.queryExports = [
  {
    name: 'should query all exports',
    cb: async () => {
      await populateDb();

      const ret = await ServiceHoursExportsModel.queryExports({ type: 'user_id', order: 'ASC' });

      expect(ret.length).toBeGreaterThan(0);
      expect(ret[0]).toMatchObject({
        user_id: expect.any(Number),
        username: expect.any(String),
        service_hours: expect.any(Number),
      });
    },
    cleanup: async () => await recreateDB(),
  },
];

suite.formatXLSX = [
  {
    name: 'should format xlsx',
    cb: async () => {
      await populateDb();

      const ret = await ServiceHoursExportsModel.formatXLSX({ type: 'user_id', order: 'ASC' });

      expect(ret).toMatchObject({
        name: 'service hours',
        data: expect.any(Array),
        options: expect.any(Object),
      });
    },
    cleanup: async () => await recreateDB(),
  },
];

suite.packXLSX = [
  {
    name: 'should pack xlsx',
    cb: async () => {
      await populateDb();

      const ret = await ServiceHoursExportsModel.packXLSX('user_id', 'ASC');

      expect(ret).toBeInstanceOf(Buffer);
    },
    cleanup: async () => await recreateDB(),
  },
];

runSuite(SUITE_NAME, suite);
