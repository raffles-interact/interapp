import { HTTPErrors } from '@utils/errors';
import appDataSource from '@utils/init_datasource';
import minioClient from '@utils/init_minio';
import dataUrlToBuffer from '@utils/dataUrlToBuffer';
import { AttendanceStatus, Service, ServiceSession, ServiceSessionUser } from '@db/entities';
import { UserModel } from './user';
import redisClient from '@utils/init_redis';

const MINIO_BUCKETNAME = process.env.MINIO_BUCKETNAME as string;
export class ServiceModel {
  public static async createService(
    service: Omit<Service, 'service_id' | 'service_ic' | 'user_service' | 'service_sessions'>,
  ) {
    const newService = new Service();
    newService.name = service.name;
    newService.description = service.description;
    newService.contact_email = service.contact_email;
    newService.contact_number = service.contact_number;
    newService.website = service.website;
    newService.enable_scheduled = service.enable_scheduled;
    newService.service_hours = service.service_hours;

    if (!service.promotional_image) newService.promotional_image = null;
    else {
      const convertedFile = dataUrlToBuffer(service.promotional_image);
      if (!convertedFile) {
        throw HTTPErrors.INVALID_DATA_URL;
      }
      await minioClient.putObject(
        MINIO_BUCKETNAME,
        'service/' + service.name,
        convertedFile.buffer,
        { 'Content-Type': convertedFile.mimetype },
      );
      newService.promotional_image = 'service/' + service.name;
    }

    newService.day_of_week = service.day_of_week;
    newService.start_time = service.start_time;
    newService.end_time = service.end_time;

    const service_ic = await UserModel.getUser(service.service_ic_username);
    newService.service_ic = service_ic;
    newService.service_ic_username = service.service_ic_username;
    try {
      await appDataSource.manager.insert(Service, newService);
    } catch (e) {
      throw HTTPErrors.ALREADY_EXISTS;
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
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }
    if (service.promotional_image)
      service.promotional_image = await minioClient.presignedGetObject(
        MINIO_BUCKETNAME,
        service.promotional_image as string,
      );
    return service;
  }
  public static async updateService(service: Service) {
    const service_ic = await UserModel.getUser(service.service_ic_username);
    if (!service.promotional_image) service.promotional_image = null;
    else {
      // why we do this:
      // if promotional_image is a URL, then it is not changed
      // if promotional_image is a data:image/gif...., then it is changed to a URL and dumped into minio
      // in either case, service.promotional_image points to the location of the image in minio
      if (service.promotional_image.startsWith('data:')) {
        const convertedFile = dataUrlToBuffer(service.promotional_image);
        if (!convertedFile) {
          throw HTTPErrors.INVALID_DATA_URL;
        }
        await minioClient.putObject(
          MINIO_BUCKETNAME,
          'service/' + service.name,
          convertedFile.buffer,
        );
      }
      service.promotional_image = 'service/' + service.name;
    }

    service.service_ic = service_ic;
    try {
      await appDataSource.manager.update(Service, { service_id: service.service_id }, service);
    } catch (e) {
      throw HTTPErrors.ALREADY_EXISTS;
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
    for (const service of services) {
      if (service.promotional_image)
        service.promotional_image = await minioClient.presignedGetObject(
          MINIO_BUCKETNAME,
          service.promotional_image as string,
        );
    }
    return services;
  }
  public static async createServiceSession(
    service_session: Omit<
      ServiceSession,
      'service_session_id' | 'service' | 'service_session_users'
    >,
  ) {
    const session = new ServiceSession();
    session.service_id = service_session.service_id;
    const validTime = new Date(service_session.start_time) > new Date(service_session.end_time);
    if (validTime) {
      throw HTTPErrors.INVALID_TIME_INTERVAL;
    }
    session.start_time = service_session.start_time;
    session.end_time = service_session.end_time;
    session.ad_hoc_enabled = service_session.ad_hoc_enabled;
    session.service_hours = service_session.service_hours;
    session.service = await this.getService(service_session.service_id);
    try {
      await appDataSource.manager.insert(ServiceSession, session);
    } catch (e) {
      throw HTTPErrors.ALREADY_EXISTS;
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
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }
    return res;
  }
  public static async updateServiceSession(
    service_session: Omit<ServiceSession, 'service_session_users' | 'service'>,
  ) {
    const service = await this.getService(service_session.service_id); // check if service exists

    const validTime = new Date(service_session.start_time) > new Date(service_session.end_time);
    if (validTime) {
      throw HTTPErrors.INVALID_TIME_INTERVAL;
    }
    try {
      await appDataSource.manager.update(
        ServiceSession,
        { service_session_id: service_session.service_session_id },
        { ...service_session, service },
      );
    } catch (e) {
      throw HTTPErrors.ALREADY_EXISTS;
    }
    return await this.getServiceSession(service_session.service_session_id);
  }
  public static async deleteServiceSession(service_session_id: number) {
    await appDataSource.manager.delete(ServiceSession, { service_session_id });
  }

  public static async createServiceSessionUser(
    user_session: Omit<ServiceSessionUser, 'service_session' | 'user'>,
  ) {
    const session = new ServiceSessionUser();
    session.service_session_id = user_session.service_session_id;
    session.username = user_session.username;
    session.ad_hoc = user_session.ad_hoc;
    session.attended = user_session.attended;
    session.is_ic = user_session.is_ic;
    session.service_session = await this.getServiceSession(user_session.service_session_id);
    if (!session.service_session.ad_hoc_enabled && session.ad_hoc) {
      throw HTTPErrors.AD_HOC_NOT_ENABLED;
    }
    session.user = await UserModel.getUser(user_session.username);
    try {
      await appDataSource.manager.insert(ServiceSessionUser, session);
    } catch (e) {
      throw HTTPErrors.ALREADY_EXISTS;
    }
    return session;
  }
  public static async createServiceSessionUsers(
    user_sessions: Omit<ServiceSessionUser, 'service_session' | 'user'>[],
  ) {
    const sessions = [];
    for (const user_session of user_sessions) {
      const session = new ServiceSessionUser();
      session.service_session_id = user_session.service_session_id;
      session.username = user_session.username;
      session.ad_hoc = user_session.ad_hoc;
      session.attended = user_session.attended;
      session.is_ic = user_session.is_ic;
      session.service_session = await this.getServiceSession(user_session.service_session_id);
      if (!session.service_session.ad_hoc_enabled && session.ad_hoc) {
        throw HTTPErrors.AD_HOC_NOT_ENABLED;
      }
      session.user = await UserModel.getUser(user_session.username);
      sessions.push(session);
    }
    try {
      await appDataSource.manager.insert(ServiceSessionUser, sessions);
    } catch (e) {
      throw HTTPErrors.ALREADY_EXISTS;
    }
    return sessions;
  }
  public static async getServiceSessionUser(service_session_id: number, username: string) {
    const res = await appDataSource.manager
      .createQueryBuilder()
      .select('service_session_user')
      .from(ServiceSessionUser, 'service_session_user')
      .where('service_session_id = :service_session_id', { service_session_id })
      .andWhere('username = :username', { username })
      .getOne();
    if (!res) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }
    return res;
  }
  public static async getServiceSessionUsers(service_session_id: number) {
    const res = await appDataSource.manager
      .createQueryBuilder()
      .select('service_session_user')
      .from(ServiceSessionUser, 'service_session_user')
      .where('service_session_id = :service_session_id', { service_session_id })
      .getMany();
    return res;
  }
  public static async updateServiceSessionUser(
    new_service_session_user: Omit<ServiceSessionUser, 'service_session' | 'user'>,
  ) {
    const service_session = await this.getServiceSession(
      new_service_session_user.service_session_id,
    ); // check if service session exists
    const user = await UserModel.getUser(new_service_session_user.username); // check if user exists
    try {
      await appDataSource.manager.update(
        ServiceSessionUser,
        {
          service_session_id: new_service_session_user.service_session_id,
          username: new_service_session_user.username,
        },
        { ...new_service_session_user, service_session, user },
      );
    } catch (e) {
      throw HTTPErrors.ALREADY_EXISTS;
    }
    return await this.getServiceSessionUser(
      new_service_session_user.service_session_id,
      new_service_session_user.username,
    );
  }
  public static async deleteServiceSessionUser(service_session_id: number, username: string) {
    await appDataSource.manager.delete(ServiceSessionUser, { service_session_id, username });
  }
  public static async deleteServiceSessionUsers(service_session_id: number, usernames: string[]) {
    await appDataSource.manager
      .createQueryBuilder()
      .delete()
      .from(ServiceSessionUser)
      .where('service_session_id = :service_session_id', { service_session_id })
      .andWhere('username IN (:...usernames)', { usernames })
      .execute();
  }
  public static async getAllServiceSessions(page?: number, perPage?: number, service_id?: number) {
    const parseRes = (res: (Omit<ServiceSession, 'service'> & { service?: Service })[]) =>
      res.map((session) => {
        const service_name = session.service?.name;
        delete session.service;
        return { ...session, service_name };
      });
    const condition = service_id ? 'service_session.service_id = :service_id' : '1 = 1';

    const total_entries = await appDataSource.manager
      .createQueryBuilder()
      .select('service_session')
      .from(ServiceSession, 'service_session')
      .where(condition, { service_id })
      .getCount();

    const res = await appDataSource.manager
      .createQueryBuilder()
      .select('service_session')
      .from(ServiceSession, 'service_session')
      .where(condition, { service_id })

      .leftJoinAndSelect('service_session.service_session_users', 'service_session_users')
      .leftJoin('service_session.service', 'service')
      .addSelect('service.name')
      .take(page && perPage ? perPage : undefined)
      .skip(page && perPage ? (page - 1) * perPage : undefined)
      .orderBy('service_session.start_time', 'DESC')
      .getMany();

    return { data: parseRes(res), total_entries, length_of_page: res.length };
  }
  public static async getActiveServiceSessions() {
    const active = await redisClient.hGetAll('service_session');

    if (Object.keys(active).length === 0) return [];

    const ICs: {
      username: string;
      service_session_id: number;
    }[] = await appDataSource.manager
      .createQueryBuilder()
      .select(['service_session_user.username', 'service_session_user.service_session_id'])
      .from(ServiceSessionUser, 'service_session_user')
      .where('service_session_id IN (:...service_session_ids)', {
        service_session_ids: Object.values(active).map((v) => parseInt(v)),
      })
      .andWhere('service_session_user.is_ic = true')
      .getMany();

    // sort by service_session_id
    const sortedICs = ICs.reduce(
      (acc, cur) => {
        acc[cur.service_session_id] = acc[cur.service_session_id] ?? [];
        acc[cur.service_session_id].push(cur.username);
        return acc;
      },
      {} as { [key: number]: string[] },
    );

    return Object.entries(active).map(([hash, id]) => ({
      [hash]: {
        service_session_id: parseInt(id),
        ICs: sortedICs[parseInt(id)],
      },
    }));
  }
  public static async verifyAttendance(hash: string, username: string) {
    const id = await redisClient.hGet('service_session', hash);
    if (!id) {
      throw HTTPErrors.INVALID_HASH;
    }
    const service_session_id = parseInt(id);

    const service_session_user = await this.getServiceSessionUser(service_session_id, username);

    if (service_session_user.attended === AttendanceStatus.Attended) {
      throw HTTPErrors.ALREADY_ATTENDED;
    }
    service_session_user.attended = AttendanceStatus.Attended;
    await this.updateServiceSessionUser(service_session_user);

    // get some metadata and return it to the user

    type _Return = {
      start_time: string;
      end_time: string;
      service_hours: number;
      name: string;
      ad_hoc: boolean;
    };
    const res = await appDataSource.manager
      .createQueryBuilder()
      .select([
        'service_session.start_time',
        'service_session.end_time',
        'service_session.service_hours',
        'service.name',
      ])
      .from(ServiceSession, 'service_session')
      .leftJoin('service_session.service', 'service')
      .where('service_session_id = :id', { id: service_session_id })
      .getOne();

    // literally impossible for this to be null
    if (!res) {
      throw HTTPErrors.RESOURCE_NOT_FOUND;
    }

    return {
      start_time: res.start_time,
      end_time: res.end_time,
      service_hours: res.service_hours,
      name: res.service.name,
      ad_hoc: service_session_user.ad_hoc,
    } as _Return;
  }
  public static async getAdHocServiceSessions() {
    const res = await appDataSource.manager
      .createQueryBuilder()
      .select('service_session')
      .from(ServiceSession, 'service_session')
      .where('service_session.ad_hoc_enabled = true')
      .getMany();
    return res;
  }
}
