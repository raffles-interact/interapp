// Usage: POSTGRES_HOST=localhost REDIS_URL=redis://localhost:6379 MINIO_ENDPOINT=localhost bun run scripts/create-sessions.ts
import { ServiceModel, UserModel } from '@models/.';
import { User } from '@db/entities/user';
import { AttendanceStatus } from '@db/entities/service_session_user';

function constructDate(day_of_week: number, time: string) {
  const d = new Date();

  // Set the day of the week
  d.setDate(d.getDate() + ((day_of_week + 7 - d.getDay()) % 7));

  // Set the time
  const [hours, minutes] = time.split(':');
  d.setHours(Number(hours), Number(minutes), 0, 0);

  // Calculate the timezone offset for Singapore (UTC+8) in minutes
  const singaporeOffset = -8 * 60;

  // Adjust the date for the timezone offset
  d.setMinutes(d.getMinutes() + singaporeOffset);

  return d;
}

async function getCurrentServices() {
  // get current date and time
  // get service days of week and start and end time
  const services = await ServiceModel.getAllServices();
  return services.filter((service) => service.enable_scheduled);
}

async function scheduleSessions() {
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
      service_hours: service.service_hours,
    };

    const service_session_id = await ServiceModel.createServiceSession(detail);

    let users: Pick<User, 'username' | 'user_id' | 'email' | 'verified' | 'service_hours'>[] = [];
    try {
      users = await UserModel.getAllUsersByService(service.service_id);
    } catch (err) {
      console.error(err);
    }

    const toCreate = users.map((user) => ({
      service_session_id,
      username: user.username,
      ad_hoc: false,
      attended: AttendanceStatus.Absent,
      is_ic: user.username === service.service_ic_username,
    }));

    await ServiceModel.createServiceSessionUsers(toCreate);
    detail.attending_users = toCreate.map((u) => u.username);

    created_services.push({ [service_session_id]: detail });
  }

  console.info('created service sessions: ', created_services);
}

scheduleSessions()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
