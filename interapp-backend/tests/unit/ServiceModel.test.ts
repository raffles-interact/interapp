import { testSuites, runSuite } from '../constants.test';
import { AuthModel, ServiceModel } from '@models/.';
import { expect } from 'bun:test';
import { recreateDB, recreateRedis } from '../utils';
import redisClient from '@utils/init_redis';
import { AttendanceStatus } from '@db/entities/service_session_user';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { Service } from '@db/entities';

const SUITE_NAME = 'ServiceModel';

const suite = testSuites[SUITE_NAME];

const signUpUser = async (id: number, name: string) =>
  await AuthModel.signUp(id, name, 'sfsajhjkh@fdjfas', 'pass');

suite.createService = [
  {
    name: 'should create a service',
    cb: async () => {
      await signUpUser(1, 'test');
      const id = await ServiceModel.createService({
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00',
        end_time: '11:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      });
      expect(id).toBe(1);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should create a service with a logo',
    cb: async () => {
      await signUpUser(1, 'test');
      const img = readFileSync('tests/utils/assets/interact-logo.png', 'base64');
      const imgB64 = `data:image/png;base64,${img}`;

      const id = await ServiceModel.createService({
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00',
        end_time: '11:00',
        service_ic_username: 'test',
        promotional_image: imgB64,
        service_hours: 1,
        enable_scheduled: true,
      });
      expect(id).toBe(1);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should create many services',
    cb: async () => {
      await Promise.all([signUpUser(1, 'test'), signUpUser(2, 'test2'), signUpUser(3, 'test3')]);
      const img = readFileSync('tests/utils/assets/interact-logo.png', 'base64');
      const imgB64 = `data:image/png;base64,${img}`;

      const args: Omit<
        Service,
        'service_id' | 'service_ic' | 'user_service' | 'service_sessions'
      >[] = [
        {
          name: 'test service',
          description: 'test description',
          contact_email: 'fkjsf@fjsdakfjsa',
          day_of_week: 1,
          start_time: '10:00',
          end_time: '11:00',
          service_ic_username: 'test',
          promotional_image: imgB64,
          service_hours: 1,
          enable_scheduled: true,
        },
        {
          name: 'test service2',
          description: 'test description',
          contact_email: 'fkjsf@fjsdakfjsa',
          contact_number: 12345678,
          day_of_week: 2,
          start_time: '13:00',
          end_time: '14:00',
          service_ic_username: 'test2',
          promotional_image: imgB64,
          service_hours: 1,
          enable_scheduled: true,
        },
        {
          name: 'test service3',
          description: 'test description',
          contact_email: 'fkjsf@fjsdakfjsa',
          day_of_week: 3,
          start_time: '15:00',
          end_time: '16:00',
          service_ic_username: 'test3',
          website: 'http://test.com',
          service_hours: 1,
          enable_scheduled: false,
        },
      ];
      const ids = await Promise.all(args.map((arg) => ServiceModel.createService(arg)));
      expect(ids).toBeArrayOfSize(3);
      const services = await ServiceModel.getAllServices();
      expect(services.length).toBe(3);
      for (const arg of args) {
        for (const prop in arg) {
          if (prop === 'promotional_image') {
            continue;
          } else {
            expect(arg).toHaveProperty(prop);
          }
        }
      }
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should create a duplicate service',
    cb: async () => {
      await signUpUser(1, 'test');

      const create = async () =>
        await ServiceModel.createService({
          name: 'test service',
          description: 'test description',
          contact_email: 'fkjsf@fjsdakfjsa',
          day_of_week: 1,
          start_time: '10:00',
          end_time: '11:00',
          service_ic_username: 'test',
          service_hours: 1,
          enable_scheduled: true,
        });

      await create();
      for (let i = 0; i < 10; i++) {
        expect(create()).rejects.toThrow();
      }
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should create a service with duplicate service IC username',
    cb: async () => {
      await signUpUser(1, 'test');
      const create = async (id: number) =>
        await ServiceModel.createService({
          name: 'test service' + id,
          description: 'test description',
          contact_email: 'fkjsf@fjsdakfjsa',
          day_of_week: 1,
          start_time: '10:00',
          end_time: '11:00',
          service_ic_username: 'test',

          service_hours: 1,
          enable_scheduled: true,
        });
      // create 1 service first
      await create(0);
      // create 10 services with same service IC username
      // should no longer throw an error
      for (let i = 1; i < 10; i++) {
        expect(create(i)).resolves.toBeDefined();
      }
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
];

suite.getService = [
  {
    name: 'should get a service',
    cb: async () => {
      // create user and service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',

        service_hours: 1,
        enable_scheduled: true,
      };
      await signUpUser(1, 'test');
      await ServiceModel.createService(serviceData);
      const service = await ServiceModel.getService(1);
      expect(service).toMatchObject(serviceData);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not get a non-existent service',
    cb: async () => {
      expect(ServiceModel.getService(1)).rejects.toThrow();
    },
  },
];

suite.updateService = [
  {
    name: 'should update a service',
    cb: async () => {
      // create user and service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      await signUpUser(1, 'test');
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);

      let service = await ServiceModel.getService(1);
      // update service
      const mut = {
        name: 'updated service',
        description: 'updated description',
        contact_email: 'updated email',
        day_of_week: 2,
        start_time: '12:00:00',
      };
      service = { ...service, ...mut };

      const updatedService = await ServiceModel.updateService(service);
      for (const key in mut) {
        expect(updatedService).toHaveProperty(key, (mut as any)[key]);
      }
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not update a non existent service',
    cb: async () => {
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      await signUpUser(1, 'test');
      const service = await ServiceModel.createService(serviceData);
      expect(service).toBe(1);

      const updatedService = await ServiceModel.getService(1);
      updatedService.service_id = 2;
      expect(ServiceModel.updateService(updatedService)).rejects.toThrow();
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should update a service with a logo',
    cb: async () => {
      // create user and service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      await signUpUser(1, 'test');
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);

      const service = await ServiceModel.getService(1);
      // update service
      const img = readFileSync('tests/utils/assets/interact-logo.png', 'base64');
      const imgB64 = `data:image/png;base64,${img}`;
      service.promotional_image = imgB64;

      const updatedService = await ServiceModel.updateService(service);
      expect(updatedService).toHaveProperty('promotional_image');
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
];

suite.deleteService = [
  {
    name: 'should delete a service',
    cb: async () => {
      // create user and service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      await signUpUser(1, 'test');
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      expect(ServiceModel.deleteService(1)).resolves.toBeUndefined();

      // check that service is deleted
      expect(ServiceModel.getService(1)).rejects.toThrow();
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not delete a non-existent service',
    cb: async () => {
      expect(ServiceModel.deleteService(1)).resolves.toBeUndefined();
    },
  },
];

suite.getAllServices = [
  {
    name: 'should get all services',
    cb: async () => {
      // create user and service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      await signUpUser(1, 'test');
      await ServiceModel.createService(serviceData);
      const services = await ServiceModel.getAllServices();
      expect(services).toBeArrayOfSize(1);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should get all services with a logo',
    cb: async () => {
      // create user and service
      const img = readFileSync('tests/utils/assets/interact-logo.png', 'base64');
      const imgB64 = `data:image/png;base64,${img}`;

      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        promotional_image: imgB64,
        service_hours: 1,
        enable_scheduled: true,
      };
      await signUpUser(1, 'test');
      await ServiceModel.createService(serviceData);
      const services = await ServiceModel.getAllServices();
      expect(services).toBeArrayOfSize(1);
      expect(services[0]).toHaveProperty('promotional_image');
      expect(services[0].promotional_image).toBeDefined();
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should get multiple services',
    cb: async () => {
      const generateService = async (id: number) => {
        const serviceData = {
          name: 'test service' + id,
          description: 'test description',
          contact_email: 'fkjsf@fjsdakfjsa',
          day_of_week: 1,
          start_time: '10:00:00',
          end_time: '11:00:00',
          service_ic_username: 'test' + id,
          service_hours: 1,
          enable_scheduled: true,
        };
        await signUpUser(id, 'test' + id);
        await ServiceModel.createService(serviceData);
      };
      const svcs = [...Array(10).keys()].map(async (id) => await generateService(id));
      await Promise.all(svcs);
      const services = await ServiceModel.getAllServices();
      expect(services).toBeArrayOfSize(10);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
];

suite.createServiceSession = [
  {
    name: 'should create a service session',
    cb: async () => {
      // create user and service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',

        service_hours: 1,
        enable_scheduled: true,
      };
      await signUpUser(1, 'test');
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);
      const sessionData = {
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      const sessionId = await ServiceModel.createServiceSession(sessionData);
      expect(sessionId).toBe(1);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should create multiple service sessions',
    cb: async () => {
      // create user and service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      await signUpUser(1, 'test');
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service sessions

      const createSession = async (id: number) => {
        const now = new Date();
        const inOneHour = new Date();
        inOneHour.setHours(now.getHours() + 1);
        const sessionData = {
          service_id: 1,
          start_time: now.toISOString(),
          end_time: inOneHour.toISOString(),
          ad_hoc_enabled: true,
          service_hours: 1,
        };
        const sessionId = await ServiceModel.createServiceSession(sessionData);
        expect(sessionId).toBe(id);
      };
      for (let i = 1; i <= 10; i++) {
        await createSession(i);
      }
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not create a service session with invalid service id',
    cb: async () => {
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);
      const sessionData = {
        service_id: 2,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      expect(ServiceModel.createServiceSession(sessionData)).rejects.toThrow();
    },
  },
  {
    name: 'should not create a service session with invalid start time and end time',
    cb: async () => {
      // create user and service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      await signUpUser(1, 'test');
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() - 1);
      const sessionData = {
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      expect(ServiceModel.createServiceSession(sessionData)).rejects.toThrow();
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not be able to parse invalid start time and end time',
    cb: async () => {
      // create user and service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      await signUpUser(1, 'test');
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service session
      const sessionData = {
        service_id: 1,
        start_time: 'invalid',
        end_time: 'invalid',
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      expect(ServiceModel.createServiceSession(sessionData)).rejects.toThrow();
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
];

suite.getServiceSession = [
  {
    name: 'should get a service session',
    cb: async () => {
      // create user and service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);
      const sessionData = {
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      await signUpUser(1, 'test');
      await ServiceModel.createService(serviceData);
      const id = await ServiceModel.createServiceSession(sessionData);
      expect(id).toBe(1);
      const session = await ServiceModel.getServiceSession(1);
      expect(session).toMatchObject({
        ...sessionData,
        service_session_id: 1,
        start_time: expect.any(Date),
        end_time: expect.any(Date),
      });
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not get a non-existent service session',
    cb: async () => {
      expect(ServiceModel.getServiceSession(1)).rejects.toThrow();
    },
  },
];

suite.updateServiceSession = [
  {
    name: 'should update a service session',
    cb: async () => {
      // create user and service
      await signUpUser(1, 'test');
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);
      const sessionData = {
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      const sessionId = await ServiceModel.createServiceSession(sessionData);
      expect(sessionId).toBe(1);
      // update service session
      const session = await ServiceModel.getServiceSession(1);
      session.ad_hoc_enabled = false;
      const updatedSession = await ServiceModel.updateServiceSession(session);
      expect(updatedSession).toMatchObject({
        ...sessionData,
        service_session_id: 1,
        start_time: expect.any(Date),
        end_time: expect.any(Date),
        ad_hoc_enabled: false,
      });
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not update a non-existent service session',
    cb: async () => {
      const sessionData = {
        service_session_id: 1,
        service_id: 1,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      expect(ServiceModel.updateServiceSession(sessionData)).rejects.toThrow();
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not update a service session with invalid start time and end time',
    cb: async () => {
      // create user and service
      await signUpUser(1, 'test');
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);
      const sessionData = {
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      const sessionId = await ServiceModel.createServiceSession(sessionData);
      expect(sessionId).toBe(1);
      // update service session
      const session = await ServiceModel.getServiceSession(1);
      session.start_time = inOneHour.toISOString();
      session.end_time = now.toISOString();
      expect(ServiceModel.updateServiceSession(session)).rejects.toThrow();
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
];

suite.deleteServiceSession = [
  {
    name: 'should delete a service session',
    cb: async () => {
      // create user and service
      await signUpUser(1, 'test');
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);
      const sessionData = {
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      const sessionId = await ServiceModel.createServiceSession(sessionData);
      expect(sessionId).toBe(1);
      expect(ServiceModel.deleteServiceSession(1)).resolves.toBeUndefined();
      expect(ServiceModel.getServiceSession(1)).rejects.toThrow();
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not delete a non-existent service session',
    cb: async () => {
      expect(ServiceModel.deleteServiceSession(1)).resolves.toBeUndefined();
    },
  },
];

suite.createServiceSessionUser = [
  {
    name: 'should create a service session user',
    cb: async () => {
      // create user and service
      await signUpUser(1, 'test');
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);
      const sessionData = {
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      const sessionId = await ServiceModel.createServiceSession(sessionData);
      expect(sessionId).toBe(1);
      // create service session user
      const sessionUserData = {
        service_session_id: 1,
        username: 'test',
        is_ic: true,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      };
      const serviceSessionUser = await ServiceModel.createServiceSessionUser(sessionUserData);
      expect(serviceSessionUser).toMatchObject(sessionUserData);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should create multiple service session users',
    cb: async () => {
      for (let i = 1; i <= 10; i++) {
        await signUpUser(i, 'test' + i);
      }
      // create service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test1',
        service_hours: 1,
        enable_scheduled: true,
      };
      const serviceId = await ServiceModel.createService(serviceData);
      expect(serviceId).toBe(1);

      const createSession = async (id: number) => {
        const now = new Date();
        const inOneHour = new Date();
        inOneHour.setHours(now.getHours() + 1);
        const sessionData = {
          service_id: 1,
          start_time: now.toISOString(),
          end_time: inOneHour.toISOString(),
          ad_hoc_enabled: true,
          service_hours: 1,
        };
        const sessionId = await ServiceModel.createServiceSession(sessionData);
        expect(sessionId).toBe(id);
      };

      for (let i = 1; i <= 10; i++) {
        await createSession(i);
      }

      const createSessionUser = async (session_id: number, id: number) => {
        const sessionUserData = {
          service_session_id: session_id,
          username: 'test' + id,
          is_ic: true,
          attended: AttendanceStatus.Attended,
          ad_hoc: false,
        };
        const serviceSessionUser = await ServiceModel.createServiceSessionUser(sessionUserData);
        expect(serviceSessionUser).toMatchObject(sessionUserData);
      };

      const creates = [];
      for (let i = 1; i <= 10; i++) {
        for (let j = 1; j <= 10; j++) {
          creates.push(async () => await createSessionUser(i, j));
        }
      }
      await Promise.all(creates.map((create) => create()));
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not create a service session user with invalid service session id',
    cb: async () => {
      // create service session user
      const sessionUserData = {
        service_session_id: 1,
        username: 'test',
        is_ic: true,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      };
      expect(ServiceModel.createServiceSessionUser(sessionUserData)).rejects.toThrow();
    },
  },
];

suite.createServiceSessionUsers = [
  {
    name: 'should create multiple service session users',
    cb: async () => {
      for (let i = 1; i <= 10; i++) {
        await signUpUser(i, 'test' + i);
      }
      // create service
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 1,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test1',
        service_hours: 1,
        enable_scheduled: true,
      };
      const serviceId = await ServiceModel.createService(serviceData);
      expect(serviceId).toBe(1);

      const createSession = async (id: number) => {
        const now = new Date();
        const inOneHour = new Date();
        inOneHour.setHours(now.getHours() + 1);
        const sessionData = {
          service_id: 1,
          start_time: now.toISOString(),
          end_time: inOneHour.toISOString(),
          ad_hoc_enabled: true,
          service_hours: 1,
        };
        const sessionId = await ServiceModel.createServiceSession(sessionData);
        expect(sessionId).toBe(id);
      };

      for (let i = 1; i <= 10; i++) {
        await createSession(i);
      }

      const sessionUser = (session_id: number, id: number) => {
        const sessionUserData = {
          service_session_id: session_id,
          username: 'test' + id,
          is_ic: true,
          attended: AttendanceStatus.Attended,
          ad_hoc: false,
        };
        return sessionUserData;
      };

      const sessionUsers = [];
      for (let i = 1; i <= 10; i++) {
        for (let j = 1; j <= 10; j++) {
          sessionUsers.push(sessionUser(i, j));
        }
      }

      const createdSessionUsers = await ServiceModel.createServiceSessionUsers(sessionUsers);
      expect(createdSessionUsers).toBeArrayOfSize(100);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
];

suite.getServiceSessionUser = [
  {
    name: 'should get a service session user',
    cb: async () => {
      // create user and service
      await signUpUser(1, 'test');
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        contact_number: 12345678,
        day_of_week: 2,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      };
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);
      const sessionData = {
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      const sessionId = await ServiceModel.createServiceSession(sessionData);
      expect(sessionId).toBe(1);
      // create service session user
      const sessionUserData = {
        service_session_id: 1,
        username: 'test',
        is_ic: true,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      };
      const serviceSessionUser = await ServiceModel.createServiceSessionUser(sessionUserData);
      expect(serviceSessionUser).toMatchObject(sessionUserData);
      const sessionUser = await ServiceModel.getServiceSessionUser(1, 'test');
      expect(sessionUser).toMatchObject(sessionUserData);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not get a non-existent service session user',
    cb: async () => {
      expect(ServiceModel.getServiceSessionUser(1, 'test')).rejects.toThrow();
    },
  },
];

suite.getServiceSessionUsers = [
  {
    name: 'should get all service session users',
    cb: async () => {
      // create user and service
      const users = [...Array(10).keys()].map(async (id) => await signUpUser(id, 'test' + id));
      await Promise.all(users);
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 2,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test1',
        service_hours: 1,
        enable_scheduled: true,
      };
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);
      const sessionData = {
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      };
      const sessionId = await ServiceModel.createServiceSession(sessionData);
      expect(sessionId).toBe(1);
      // create service session users
      const sessionUsers = [...Array(10).keys()].map((id) => ({
        service_session_id: 1,
        username: 'test' + id,
        is_ic: true,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      }));
      const createdSessionUsers = await ServiceModel.createServiceSessionUsers(sessionUsers);
      expect(createdSessionUsers).toBeArrayOfSize(10);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'create service session users with invalid service session id',
    cb: async () => {
      // create service session users
      const sessionUsers = [...Array(10).keys()].map((id) => ({
        service_session_id: 1,
        username: 'test' + id,
        is_ic: true,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      }));
      expect(ServiceModel.createServiceSessionUsers(sessionUsers)).rejects.toThrow();
    },
  },
];

suite.updateServiceSessionUser = [
  {
    name: 'should update a service session user',
    cb: async () => {
      // create user and service
      await signUpUser(1, 'test');
      const id = await ServiceModel.createService({
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 2,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      });
      expect(id).toBe(1);
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);
      const sessionId = await ServiceModel.createServiceSession({
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      });
      expect(sessionId).toBe(1);
      // create service session user
      const sessionUserData = {
        service_session_id: 1,
        username: 'test',
        is_ic: true,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      };
      const serviceSessionUser = await ServiceModel.createServiceSessionUser(sessionUserData);
      expect(serviceSessionUser).toMatchObject(sessionUserData);
      // update service session user
      serviceSessionUser.attended = AttendanceStatus.Absent;
      serviceSessionUser.ad_hoc = true;
      const updatedSessionUser = await ServiceModel.updateServiceSessionUser(serviceSessionUser);
      expect(updatedSessionUser.attended).toBe(AttendanceStatus.Absent);
      expect(updatedSessionUser.ad_hoc).toBe(true);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
];

suite.deleteServiceSessionUser = [
  {
    name: 'should delete a service session user',
    cb: async () => {
      // create user and service
      await signUpUser(1, 'test');
      const id = await ServiceModel.createService({
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 2,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test',
        service_hours: 1,
        enable_scheduled: true,
      });
      expect(id).toBe(1);
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);

      const sessionId = await ServiceModel.createServiceSession({
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      });
      expect(sessionId).toBe(1);
      // create service session user
      const sessionUserData = {
        service_session_id: 1,
        username: 'test',
        is_ic: true,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      };
      const serviceSessionUser = await ServiceModel.createServiceSessionUser(sessionUserData);
      expect(serviceSessionUser).toMatchObject(sessionUserData);
      expect(ServiceModel.deleteServiceSessionUser(1, 'test')).resolves.toBeUndefined();
      expect(ServiceModel.getServiceSessionUser(1, 'test')).rejects.toThrow();
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not delete a non-existent service session user',
    cb: async () => {
      expect(ServiceModel.deleteServiceSessionUser(1, 'test')).resolves.toBeUndefined();
    },
  },
  {
    name: 'should not delete a service session user with invalid datatype for service session id',
    cb: async () => {
      expect(ServiceModel.deleteServiceSessionUser(100000000000000000, 'a')).rejects.toThrow(
        'value "100000000000000000" is out of range for type integer',
      );
    },
  },
];

suite.deleteServiceSessionUsers = [
  {
    name: 'should delete all service session users',
    cb: async () => {
      // create user and service
      const users = [...Array(10).keys()].map(async (id) => await signUpUser(id, 'test' + id));
      await Promise.all(users);
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 2,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test1',
        service_hours: 1,
        enable_scheduled: true,
      };
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service session
      const now = new Date();
      const inOneHour = new Date();
      inOneHour.setHours(now.getHours() + 1);

      const sessionId = await ServiceModel.createServiceSession({
        service_id: 1,
        start_time: now.toISOString(),
        end_time: inOneHour.toISOString(),
        ad_hoc_enabled: true,
        service_hours: 1,
      });
      expect(sessionId).toBe(1);
      // create service session users
      const sessionUsers = [...Array(10).keys()].map((id) => ({
        service_session_id: 1,
        username: 'test' + id,
        is_ic: true,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      }));
      const createdSessionUsers = await ServiceModel.createServiceSessionUsers(sessionUsers);
      expect(createdSessionUsers).toBeArrayOfSize(10);

      const usernames = sessionUsers.map((sessionUser) => sessionUser.username);
      expect(ServiceModel.deleteServiceSessionUsers(1, usernames)).resolves.toBeUndefined();
      expect(ServiceModel.getServiceSessionUsers(1)).resolves.toEqual([]);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
];

suite.getAllServiceSessions = [
  {
    name: 'should get all service sessions',
    cb: async () => {
      // create user and service
      const users = [...Array(10).keys()].map(async (id) => await signUpUser(id, 'test' + id));
      await Promise.all(users);
      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 2,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test1',
        service_hours: 1,
        enable_scheduled: true,
      };
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);
      // create service sessions
      const createSession = async (id: number) => {
        const now = new Date();
        const inOneHour = new Date();
        inOneHour.setHours(now.getHours() + 1);
        const sessionData = {
          service_id: 1,
          start_time: now.toISOString(),
          end_time: inOneHour.toISOString(),
          ad_hoc_enabled: true,
          service_hours: 1,
        };
        const sessionId = await ServiceModel.createServiceSession(sessionData);
        expect(sessionId).toBe(id);
      };
      for (let i = 1; i <= 10; i++) {
        await createSession(i);
      }
      const sessions = await ServiceModel.getAllServiceSessions();
      expect(sessions.data).toBeArrayOfSize(10);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
  {
    name: 'should not get all service sessions that do not exist',
    cb: async () => {
      const sessions = await ServiceModel.getAllServiceSessions();
      expect(sessions.data).toBeArrayOfSize(0);
    },
  },
];

suite.getAdHocServiceSessions = [
  {
    name: 'should get all ad hoc service sessions',
    cb: async () => {
      // create user and service
      const users = [...Array(20).keys()].map(async (id) => await signUpUser(id, 'test' + id));
      await Promise.all(users);

      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 2,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test1',
        service_hours: 1,
        enable_scheduled: true,
      };
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);

      // create service sessions
      // half of the sessions are ad hoc
      const createSession = async (id: number, ad_hoc: boolean) => {
        const now = new Date();
        const inOneHour = new Date();
        inOneHour.setHours(now.getHours() + 1);
        const sessionData = {
          service_id: 1,
          start_time: now.toISOString(),
          end_time: inOneHour.toISOString(),
          ad_hoc_enabled: ad_hoc,
          service_hours: 1,
        };
        const sessionId = await ServiceModel.createServiceSession(sessionData);
        expect(sessionId).toBe(id);
      };
      for (let i = 1; i <= 10; i++) {
        await createSession(i, true);
      }
      for (let i = 11; i <= 20; i++) {
        await createSession(i, false);
      }
      const sessions = await ServiceModel.getAdHocServiceSessions();
      expect(sessions).toBeArrayOfSize(10);
    },
    cleanup: async () => {
      await recreateDB();
    },
  },
];

suite.getActiveServiceSessions = [
  {
    name: 'should get all active service sessions',
    cb: async () => {
      // create user and service
      const users = [...Array(20).keys()].map(async (id) => await signUpUser(id, 'test' + id));
      await Promise.all(users);

      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 2,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test1',
        service_hours: 1,
        enable_scheduled: true,
      };
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);

      // create service sessions

      // half of the sessions are active
      const createSession = async (id: number, active: boolean) => {
        const now = new Date();
        const inOneHour = new Date();
        inOneHour.setHours(now.getHours() + 1);
        const sessionData = {
          service_id: 1,
          start_time: now.toISOString(),
          end_time: inOneHour.toISOString(),
          ad_hoc_enabled: true,
          service_hours: 1,
        };
        const sessionId = await ServiceModel.createServiceSession(sessionData);
        expect(sessionId).toBe(id);

        if (!active) return;
        const newHash = randomBytes(128).toString('hex');

        await redisClient.hSet('service_session', newHash, sessionId);
      };

      for (let i = 1; i <= 10; i++) {
        await createSession(i, true);
      }
      for (let i = 11; i <= 20; i++) {
        await createSession(i, false);
      }
      const sessions = await ServiceModel.getActiveServiceSessions();
      expect(sessions).toBeArrayOfSize(10);
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
];

suite.verifyAttendance = [
  {
    name: 'should verify attendance',
    cb: async () => {
      // create user and service
      const users = [...Array(10).keys()].map(async (id) => await signUpUser(id, 'test' + id));
      await Promise.all(users);

      const serviceData = {
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 2,
        start_time: '10:00:00',
        end_time: '11:00:00',
        service_ic_username: 'test1',
        service_hours: 1,
        enable_scheduled: true,
      };
      const id = await ServiceModel.createService(serviceData);
      expect(id).toBe(1);

      // create service sessions
      const createSession = async () => {
        const now = new Date();
        const inOneHour = new Date();
        inOneHour.setHours(now.getHours() + 1);
        const sessionData = {
          service_id: 1,
          start_time: now.toISOString(),
          end_time: inOneHour.toISOString(),
          ad_hoc_enabled: true,
          service_hours: 1,
        };
        const sessionId = await ServiceModel.createServiceSession(sessionData);
        expect(sessionId).toBe(1);
        const newHash = randomBytes(128).toString('hex');

        await redisClient.hSet('service_session', newHash, sessionId);
        return newHash;
      };
      const hash = await createSession();

      // create service session users
      const sessionUsers = [...Array(10).keys()].map((id) => ({
        service_session_id: 1,
        username: 'test' + id,
        is_ic: true,
        attended: AttendanceStatus.Absent,
        ad_hoc: false,
      }));
      const createdSessionUsers = await ServiceModel.createServiceSessionUsers(sessionUsers);
      expect(createdSessionUsers).toBeArrayOfSize(10);

      const usernames = sessionUsers.map((sessionUser) => sessionUser.username);
      let att = [];
      for (const username of usernames) {
        const res = await ServiceModel.verifyAttendance(hash, username);
        expect(res).toBeDefined();
        att.push(res);
      }

      expect(att).toBeArrayOfSize(10);
    },
    cleanup: async () => {
      await recreateDB();
      await recreateRedis();
    },
  },
  {
    name: 'should not verify attendance with invalid hash',
    cb: async () => {
      expect(ServiceModel.verifyAttendance('invalid', 'test')).rejects.toThrow();
    },
  },
];

runSuite(SUITE_NAME, suite);