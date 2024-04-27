import { runSuite, testSuites } from '../constants.test';
import { AttendanceExportsModel, AuthModel, ServiceModel, UserModel } from '@models/.';
import { recreateDB } from '../utils';
import { AttendanceStatus, User } from '@db/entities';
import { expect } from 'bun:test';

const SUITE_NAME = 'AttendanceExportsModel';
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

      const ret = await AttendanceExportsModel.queryExports({ id: 1 });

      expect(ret.length).toBe(10);
      expect(ret[0]).toMatchObject({
        service_session_id: 1,
        start_time: expect.any(Date),
        end_time: expect.any(Date),
        service: {
          name: 'a',
          service_id: 1,
        },
      });
      expect(ret[0].service_session_users.length).toBe(10);

      expect(ret[0].service_session_users[0]).toMatchObject({
        service_session_id: 1,
        username: 'user0',
        ad_hoc: false,
        attended: AttendanceStatus.Absent,
        is_ic: true,
      });

      for (let sess of ret) {
        for (let [idx, user] of sess.service_session_users.entries()) {
          expect(user.username).toBe(`user${idx}`);
          expect(user.attended).toBe(AttendanceStatus.Absent);
        }
      }
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should query exports with date range',
    cb: async () => {
      await populateDb();

      const start_date = new Date();
      start_date.setDate(start_date.getDate() + 5);

      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + 5);
      const ret = await AttendanceExportsModel.queryExports({
        id: 1,
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString(),
      });

      expect(ret.length).toBe(4);
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should return length 0 if no exports found',
    cb: async () => {
      await populateDb();

      expect(AttendanceExportsModel.queryExports({ id: 2 })).resolves.toBeArrayOfSize(0);
    },
    cleanup: async () => await recreateDB(),
  }
];

suite.formatXLSX = [
  {
    name: 'should format xlsx',
    cb: async () => {
      await populateDb();

      const start_date = new Date();
      start_date.setDate(start_date.getDate() + 5);

      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + 5);

      const ret = await AttendanceExportsModel.formatXLSX({
        id: 1,
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString(),
      });

      expect(ret).toMatchObject({
        name: 'a',
        data: expect.any(Array),
        options: expect.any(Object),
      })
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw if no service not found',
    cb: async () => {
      await populateDb();

      expect(AttendanceExportsModel.formatXLSX({ id: 2 })).rejects.toThrow();
    },
    cleanup: async () => await recreateDB(),
  },{
    name: 'should throw if no exports found',
    cb: async () => {
      await populateDb();
      expect(AttendanceExportsModel.formatXLSX({ id: 1, start_date: new Date().toISOString(), end_date: new Date().toISOString() })).rejects.toThrow();
    },
    cleanup: async () => await recreateDB(),
  }
]

suite.packXLSX = [
  {
    name: 'should pack xlsx',
    cb: async () => {
      await populateDb();

      const start_date = new Date();
      start_date.setDate(start_date.getDate() + 5);

      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + 5);

      const ret = await AttendanceExportsModel.packXLSX([1], start_date.toISOString(), end_date.toISOString());

      expect(ret).toBeInstanceOf(Buffer);
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw if no service not found',
    cb: async () => {
      await populateDb();

      expect(AttendanceExportsModel.packXLSX([2])).rejects.toThrow();
    },
    cleanup: async () => await recreateDB(),
  },
  {
    name: 'should throw if no exports found',
    cb: async () => {
      await populateDb();
      expect(AttendanceExportsModel.packXLSX([1], new Date().toISOString(), new Date().toISOString())).rejects.toThrow();
    },
    cleanup: async () => await recreateDB(),
  }
];

console.log(suite);

runSuite(SUITE_NAME, suite);
