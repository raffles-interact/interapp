import { HTTPError, HTTPErrorCode } from '@utils/errors';
import appDataSource from '@utils/init_datasource';
import { Service, ServiceSession, ServiceSessionUser } from '@db/entities';

export class ServiceModel {
  public static async createService(service: Omit<Service, 'service_id'>) {
    const newService = new Service();
    newService.name = service.name;
    newService.description = service.description;
    newService.contact_email = service.contact_email;
    newService.contact_number = service.contact_number;
    newService.website = service.website;
    newService.promotional_image = service.promotional_image;
    await appDataSource.manager.save(newService);
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
    await appDataSource.manager.save(Service, service);
    return service;
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
  public static async getAllServicesByUser(username: string) {
    throw new HTTPError('Not implemented', '', HTTPErrorCode.NOT_IMPLEMENTED_ERROR);
  }
  public static async addServiceUser(service_id: number, username: string) {
    throw new HTTPError('Not implemented', '', HTTPErrorCode.NOT_IMPLEMENTED_ERROR);
  }

  public static async createServiceSession(
    service_session: Omit<ServiceSession, 'service_session_id'>,
  ) {
    throw new HTTPError('Not implemented', '', HTTPErrorCode.NOT_IMPLEMENTED_ERROR);
  }
  public static async createServiceSessionUser(service_session_id: number, username: string) {
    throw new HTTPError('Not implemented', '', HTTPErrorCode.NOT_IMPLEMENTED_ERROR);
  }
  public static async getServiceSession(service_session_id: number) {
    throw new HTTPError('Not implemented', '', HTTPErrorCode.NOT_IMPLEMENTED_ERROR);
  }
  public static async updateServiceSession(service_session: ServiceSession) {
    throw new HTTPError('Not implemented', '', HTTPErrorCode.NOT_IMPLEMENTED_ERROR);
  }
  public static async deleteServiceSession(service_session_id: number) {
    throw new HTTPError('Not implemented', '', HTTPErrorCode.NOT_IMPLEMENTED_ERROR);
  }
}
