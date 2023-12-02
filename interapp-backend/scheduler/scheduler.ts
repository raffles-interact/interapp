import { schedule } from 'node-cron';
import { ServiceModel } from '@models/service';
import { UserModel } from '@models/user';
import { User } from '@db/entities/user';
import { AttendanceStatus } from '@db/entities/service_session_user';

function constructDate(day_of_week: number, time: string) {
  const d = new Date();
  d.setDate(d.getDate() + ((day_of_week + 7 - d.getDay()) % 7));
  const [hours, minutes] = time.split(':');
  d.setHours(Number(hours), Number(minutes), 0, 0);
  return d;
}

async function getCurrentServices() {
  // get current date and time
  // get service days of week and start and end time
  const services = await ServiceModel.getAllServices();
  return services.map((service) => {
    return {
      service_id: service.service_id,
      service_ic_username: service.service_ic_username,
      day_of_week: service.day_of_week,
      start_time: service.start_time,
      end_time: service.end_time,
    };
  });
}

schedule(
  '* * * * * Sunday',
  async () => {
    const to_be_scheduled = await getCurrentServices();
    if (to_be_scheduled.length === 0) return;

    // schedule services for the week
    let created_services: { [id: number]: Record<string, string | number | boolean | string[]> }[] =
      [];
    for (const service of to_be_scheduled) {
      // create service session
      // add service session id to created_ids
      let detail = {
        service_id: service.service_id,
        start_time: constructDate(service.day_of_week, service.start_time).toISOString(),
        end_time: constructDate(service.day_of_week, service.end_time).toISOString(),
        ad_hoc_enabled: false,
        attending_users: [] as string[],
      };

      const service_session_id = await ServiceModel.createServiceSession(detail);

      let users: User[] = [];
      try {
        users = await UserModel.getAllUsersByService(service.service_id);
      } catch (err) {
        console.log(err);
      }

      for (const user of users) {
        await ServiceModel.createServiceSessionUser({
          service_session_id,
          username: user.username,
          ad_hoc: false,
          attended: AttendanceStatus.Absent,
          is_ic: user.username === service.service_ic_username,
        });
        detail.attending_users.push(user.username);
      }

      created_services.push({ [service_session_id]: detail });
    }

    console.log('created service sessions: ', created_services);
  },
  {
    timezone: 'Asia/Singapore',
  },
);
