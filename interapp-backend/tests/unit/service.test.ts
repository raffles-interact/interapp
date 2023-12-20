import { AuthModel } from '@models/auth';
import { ServiceModel } from '@models/service';
import { describe, expect, test, afterAll, beforeAll } from 'bun:test';
import { recreateDB } from '../utils/recreate_db';
import { AttendanceStatus } from '@db/entities';

describe('Unit (service)', () => {
  beforeAll(async () => {
    await AuthModel.signUp(1, 'testuser', 'sfsajhjkh@fdjfas', 'pass');
    await AuthModel.signUp(2, 'testuser2', 'sfsajhjkh@fdjfas', 'pass');
    await AuthModel.signUp(3, 'testuser3', 'sfsajhjkh@fdjfas', 'pass');
  });

  test('create service', async () => {
    const id = await ServiceModel.createService({
      name: 'test service',
      description: 'test description',
      contact_email: 'fkjsf@fjsdakfjsa',
      day_of_week: 1,
      start_time: '10:00',
      end_time: '11:00',
      service_ic_username: 'testuser',
    });
    expect(id).toBe(1);
  });

  test('get service', async () => {
    const service = await ServiceModel.getService(1);
    expect(service).toMatchObject({
      name: 'test service',
      description: 'test description',
      contact_email: 'fkjsf@fjsdakfjsa',
      day_of_week: 1,
      start_time: '10:00:00',
      end_time: '11:00:00',
      service_ic_username: 'testuser',
      promotional_image: null,
      contact_number: null,
      website: null,
    });
  });

  test('create duplicate service', async () => {
    expect(() =>
      ServiceModel.createService({
        name: 'test service',
        description: 'test description',
        contact_email: 'fkjsf@fjsdakfjsa',
        day_of_week: 1,
        start_time: '10:00',
        end_time: '11:00',
        service_ic_username: 'testuser',
      }),
    ).toThrow(
      'Service with name test service already exists, or service IC with username testuser already exists',
    );
  });

  test('update service', async () => {
    const service = await ServiceModel.getService(1);
    service.name = 'new name';
    await ServiceModel.updateService(service);
    const updatedService = await ServiceModel.getService(1);
    expect(updatedService.name).toBe('new name');
  });

  test('update service with invalid service_ic_username', async () => {
    const service = await ServiceModel.getService(1);
    service.service_ic_username = 'invalid';
    expect(() => ServiceModel.updateService(service)).toThrow(
      'The user with username invalid was not found in the database',
    );
  });

  test('create 2 more services and get all services', async () => {
    await ServiceModel.createService({
      name: 'test service 2',
      description: 'test description',
      contact_email: 'fkjsf@fjsdakfjsa',
      day_of_week: 1,
      start_time: '10:00',
      end_time: '11:00',
      service_ic_username: 'testuser2',
    });
    await ServiceModel.createService({
      name: 'test service 3',
      description: 'test description',
      contact_email: 'fkjsf@fjsdakfjsa',
      day_of_week: 1,
      start_time: '10:00',
      end_time: '11:00',
      service_ic_username: 'testuser3',
    });
    const services = await ServiceModel.getAllServices();
    expect(services).toBeArrayOfSize(3);
  });

  test('delete service', async () => {
    await ServiceModel.deleteService(3);
    expect(() => ServiceModel.getService(3)).toThrow('Service with service_id 3 does not exist');
  });

  test('create service session', async () => {
    const now = new Date();
    const inOneHour = new Date();
    inOneHour.setHours(now.getHours() + 1);
    const serviceSessionId = await ServiceModel.createServiceSession({
      service_id: 1,
      start_time: now.toISOString(),
      end_time: inOneHour.toISOString(),
      ad_hoc_enabled: false,
    });
    expect(serviceSessionId).toBe(1);
  });

  test('get service session', async () => {
    const serviceSession = await ServiceModel.getServiceSession(1);
    expect(serviceSession).toMatchObject({
      service_id: 1,
      ad_hoc_enabled: false,
    });
  });

  test('get non-existent service session', async () => {
    expect(() => ServiceModel.getServiceSession(2)).toThrow(
      'Service session with service_session_id 2 does not exist',
    );
  });

  test('update service session', async () => {
    const serviceSession = await ServiceModel.getServiceSession(1);
    serviceSession.ad_hoc_enabled = true;
    await ServiceModel.updateServiceSession(serviceSession);
    const updatedServiceSession = await ServiceModel.getServiceSession(1);
    expect(updatedServiceSession.ad_hoc_enabled).toBe(true);
  });

  test('update service session with invalid service_id', async () => {
    const serviceSession = await ServiceModel.getServiceSession(1);
    serviceSession.service_id = 2;
    expect(() => ServiceModel.updateServiceSession(serviceSession)).toThrow(
      'Service with service_id 2 does not exist',
    );
  });

  test('delete service session', async () => {
    await ServiceModel.createServiceSession({
      service_id: 1,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      ad_hoc_enabled: false,
    }); // create another service session (2)
    await ServiceModel.deleteServiceSession(2);
    expect(() => ServiceModel.getServiceSession(2)).toThrow(
      'Service session with service_session_id 2 does not exist',
    );
  });

  test('create service session user', async () => {
    const serviceSessionUserId = await ServiceModel.createServiceSessionUser({
      service_session_id: 1,
      username: 'testuser',
      is_ic: true,
      attended: AttendanceStatus.Attended,
      ad_hoc: false,
    });
    expect(serviceSessionUserId).toBeDefined();
  });

  test('create multiple service session users', async () => {
    const res = await ServiceModel.createServiceSessionUsers([
      {
        service_session_id: 1,
        username: 'testuser2',
        is_ic: false,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      },
      {
        service_session_id: 1,
        username: 'testuser3',
        is_ic: false,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      },
    ]);
    expect(res).toBeArrayOfSize(2);
  });

  test('get service session user', async () => {
    const serviceSessionUser = await ServiceModel.getServiceSessionUser(1, 'testuser');
    expect(serviceSessionUser).toMatchObject({
      username: 'testuser',
      is_ic: true,
      attended: AttendanceStatus.Attended,
      ad_hoc: false,
    });
  });

  test('get non-existent service session user', async () => {
    expect(() => ServiceModel.getServiceSessionUser(1, 'invalid')).toThrow(
      'Service session user with service_session_id 1 and username invalid does not exist',
    );
  });

  test('get service session users', async () => {
    const serviceSessionUsers = await ServiceModel.getServiceSessionUsers(1);
    expect(serviceSessionUsers).toBeArrayOfSize(3);
  });

  test('update service session user', async () => {
    await ServiceModel.updateServiceSessionUser({
      service_session_id: 1,
      username: 'testuser',
      is_ic: false,
      attended: AttendanceStatus.Attended,
      ad_hoc: false,
    });
    expect((await ServiceModel.getServiceSessionUser(1, 'testuser')).is_ic).toBe(false);
  });

  test('update service session user with invalid service_session_id', async () => {
    expect(() =>
      ServiceModel.updateServiceSessionUser({
        service_session_id: 2,
        username: 'testuser',
        is_ic: false,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      }),
    ).toThrow('Service session with service_session_id 2 does not exist');
  });

  test('update service session user with invalid username', async () => {
    expect(() =>
      ServiceModel.updateServiceSessionUser({
        service_session_id: 1,
        username: 'invalid',
        is_ic: false,
        attended: AttendanceStatus.Attended,
        ad_hoc: false,
      }),
    ).toThrow('The user with username invalid was not found in the database');
  });

  test('delete service session user', async () => {
    await ServiceModel.deleteServiceSessionUser(1, 'testuser');
    expect(() => ServiceModel.getServiceSessionUser(1, 'testuser')).toThrow(
      'Service session user with service_session_id 1 and username testuser does not exist',
    );
  });

  test('get all service sessions', async () => {
    const serviceSessions = await ServiceModel.getAllServiceSessions(1, 1, 5);
    expect(serviceSessions).toBeArrayOfSize(1);
  });
  afterAll(async () => {
    await recreateDB();
  });
});
