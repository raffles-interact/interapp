import { schedule } from 'node-cron';
import { ServiceModel } from '@models/service';
import { UserModel } from '@models/user';
import { User } from '@db/entities/user';
import { AttendanceStatus } from '@db/entities/service_session_user';
import redisClient from '@utils/init_redis';
import { randomBytes } from 'crypto';
import { $ } from 'bun';
import { existsSync, mkdirSync } from 'fs';

function constructDate(day_of_week: number, time: string) {
  const d = new Date();
  d.setDate(d.getDate() + ((day_of_week + 7 - d.getDay()) % 7));
  const [hours, minutes] = time.split(':');
  d.setHours(Number(hours), Number(minutes), 0, 0);
  return d;
}

function addHours(date: Date, hours: number) {
  date.setHours(date.getHours() + hours);
  return date;
}
async function getCurrentServices() {
  // get current date and time
  // get service days of week and start and end time
  const services = await ServiceModel.getAllServices();
  return services.filter((service) => service.enable_scheduled);
}

schedule(
  '0 0 0 * * Sunday',
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
  },
  {
    timezone: 'Asia/Singapore',
  },
);

schedule('0 */1 * * * *', async () => {
  // get all service sessions
  const service_sessions = (await ServiceModel.getAllServiceSessions()).data;

  // check if current time is within start_time and end_time - offset 10 mins
  const current_time = new Date();
  const timezone_offset_hours = current_time.getTimezoneOffset() / 60;
  const local_time = addHours(current_time, timezone_offset_hours);

  // get all hashes from redis and check if service session id is in redis else add it
  const hashes = await redisClient.hGetAll('service_session');
  console.info('hashes: ', hashes);
  for (const session of service_sessions) {
    const start_time = new Date(session.start_time);
    const end_time = new Date(session.end_time);
    const offset = new Date(start_time.getTime() - 10 * 60000);

    const withinInterval = local_time <= end_time && local_time >= offset;

    if (withinInterval) {
      // if yes, service session is active

      if (!Object.values(hashes).find((v) => v === String(session.service_session_id))) {
        // if service session id is not in redis, generate a hash as key and service session id as value

        const newHash = randomBytes(128).toString('hex');

        await redisClient.hSet('service_session', newHash, session.service_session_id);
      }
    }
    // setting expiry is not possible with hset, so we need to check if the hash is expired
    // if yes, remove it from redis
    else {
      const hash = Object.values(hashes).find((k) => k === String(session.service_session_id));
      if (hash) await redisClient.hDel('service_session', hash);
    }
  }
});

schedule('0 0 0 */1 * *', async () => {
  // this is mounted on the host machine -- see docker compose file
  const path = '/tmp/dump';
  if (!existsSync(path)) mkdirSync(path);

  const d = new Date();
  const fmted = `interapp_${d.toLocaleDateString().replace(/\//g, '')}`;

  const newFile = `${path}/${fmted}.sql`;
  await $`touch ${newFile}`;
  await $`PGPASSWORD=postgres pg_dump -U postgres -a interapp -h interapp-postgres > ${newFile}`;

  console.info('db snapshot taken at location: ', newFile);
});
