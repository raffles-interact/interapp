import { HTTPError, HTTPErrorCode } from '@utils/errors';
import appDataSource from '@utils/init_datasource';
import { Service, ServiceSession, ServiceSessionUser, User } from '@db/entities';
import { AttendanceStatus } from '@db/entities';

export class ServiceModel {
  public static async createService(service: Omit<Service, 'service_id'>) {
    const newService = new Service();
    newService.name = service.name;
    newService.description = service.description;
    newService.contact_email = service.contact_email;
    newService.contact_number = service.contact_number;
    newService.website = service.website;
    newService.promotional_image = service.promotional_image;

    newService.day_of_week = service.day_of_week;
    newService.start_time = service.start_time;
    newService.end_time = service.end_time;

    const service_ic = await appDataSource.manager
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('username = :username', { username: service.service_ic_username })
      .getOne();
    if (!service_ic) {
      throw new HTTPError(
        'Service IC not found',
        `Service IC with username ${service.service_ic_username} does not exist`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    newService.service_ic = service_ic;
    newService.service_ic_username = service.service_ic_username;
    try {
      await appDataSource.manager.insert(Service, newService);
    } catch (e) {
      throw new HTTPError(
        'Service already exists',
        `Service with name ${service.name} already exists, or service IC with username ${service.service_ic_username} already exists`,
        HTTPErrorCode.CONFLICT_ERROR,
      );
    }

    return newService.service_id;
  }
  public static async getService(service_id: number) {
    const service = await appDataSource.manager
      .createQueryBuilder()
      .select('service')
      .from(Service, 'service')
      .where('service_id = :id', { id: service_id })
      .getOne();
    if (!service) {
      throw new HTTPError(
        'Service not found',
        `Service with service_id ${service_id} does not exist`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    return service;
  }
  public static async updateService(service: Service) {
    const service_ic = await appDataSource.manager
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('username = :username', { username: service.service_ic_username })
      .getOne();
    if (!service_ic) {
      throw new HTTPError(
        'Service IC not found',
        `Service IC with username ${service.service_ic_username} does not exist`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    service.service_ic = service_ic;
    service.service_ic_username = service.service_ic_username;
    try {
      await appDataSource.manager.update(Service, { service_id: service.service_id }, service);
    } catch (e) {
      throw new HTTPError('DB error', String(e), HTTPErrorCode.BAD_REQUEST_ERROR);
    }
    return await this.getService(service.service_id);
  }
  public static async deleteService(service_id: number) {
    await appDataSource.manager.delete(Service, { service_id });
  }
  public static async getAllServices() {
    const services = await appDataSource.manager
      .createQueryBuilder()
      .select('service')
      .from(Service, 'service')
      .getMany();
    return services;
  }
  public static async createServiceSession(
    service_session: Omit<ServiceSession, 'service_session_id'>,
  ) {
    const session = new ServiceSession();
    session.service_id = service_session.service_id;
    session.start_time = service_session.start_time;
    session.end_time = service_session.end_time;
    session.ad_hoc_enabled = service_session.ad_hoc_enabled;
    session.service = await this.getService(service_session.service_id);
    try {
      await appDataSource.manager.insert(ServiceSession, session);
    } catch (e) {
      throw new HTTPError(
        'Service session already exists',
        `Service session with service_id ${service_session.service_id} already exists`,
        HTTPErrorCode.CONFLICT_ERROR,
      );
    }
    return session.service_session_id;
  }
  public static async getServiceSession(service_session_id: number) {
    const res = await appDataSource.manager
      .createQueryBuilder()
      .select('service_session')
      .from(ServiceSession, 'service_session')
      .where('service_session_id = :id', { id: service_session_id })
      .getOne();
    if (!res) {
      throw new HTTPError(
        'Service session not found',
        `Service session with service_session_id ${service_session_id} does not exist`,
        HTTPErrorCode.NOT_FOUND_ERROR,
      );
    }
    return res;
  }
  public static async updateServiceSession(service_session: ServiceSession) {
    try {
      await appDataSource.manager.update(
        ServiceSession,
        { service_session_id: service_session.service_session_id },
        service_session,
      );
    } catch (e) {
      throw new HTTPError('DB error', String(e), HTTPErrorCode.BAD_REQUEST_ERROR);
    }
    return await this.getServiceSession(service_session.service_session_id);
  }
  public static async deleteServiceSession(service_session_id: number) {
    await appDataSource.manager.delete(ServiceSession, { service_session_id });
  }

  public static async createServiceSessionUser(user_session: ServiceSessionUser) {}
  public static async getServiceSessionUser(service_session_id: number, username: string) {
    throw new HTTPError('Not implemented', '', HTTPErrorCode.NOT_IMPLEMENTED_ERROR);
  }
  public static async updateServiceSessionUser(service_session_id: number, username: string) {
    throw new HTTPError('Not implemented', '', HTTPErrorCode.NOT_IMPLEMENTED_ERROR);
  }
  public static async deleteServiceSessionUser(service_session_id: number, username: string) {
    throw new HTTPError('Not implemented', '', HTTPErrorCode.NOT_IMPLEMENTED_ERROR);
  }
}
