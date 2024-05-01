import { schedule } from 'node-cron';
import { ServiceModel, UserModel } from '@models/.';
import { User } from '@db/entities/user';
import { AttendanceStatus } from '@db/entities/service_session_user';
import redisClient from '@utils/init_redis';
import { randomBytes } from 'crypto';
import { $ } from 'bun';
import { existsSync, mkdirSync } from 'fs';

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

async function scheduleSessions() {
  const to_be_scheduled = await getCurrentServices();
  if (to_be_scheduled.length === 0) return;

  // schedule services for the week
  const created_services: { [id: number]: Record<string, string | number | boolean | string[]> }[] =
    [];
  for (const service of to_be_scheduled) {
    // create service session
    // add service session id to created_ids

    const detail = {
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

schedule('0 0 0 * * Sunday', scheduleSessions, {
  timezone: 'Asia/Singapore',
});

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

  const redisSessionIds = new Set(Object.values(hashes));
  const toDelete = [];

  for (const session of service_sessions) {
    const start_time = new Date(session.start_time);
    const end_time = new Date(session.end_time);

    const start_offset = new Date(start_time.getTime() - 10 * 60000);
    const end_offset = new Date(end_time.getTime() + 10 * 60000);

    const withinInterval = local_time <= end_offset && local_time >= start_offset;

    if (withinInterval) {
      // if yes, service session is active

      if (!redisSessionIds.has(String(session.service_session_id))) {
        // if service session id is not in redis, generate a hash as key and service session id as value

        const newHash = randomBytes(128).toString('hex');

        await redisClient.hSet('service_session', newHash, session.service_session_id);
      }
    }
    // setting expiry is not possible with hset, so we need to check if the hash is expired
    // if yes, remove it from redis
    else {
      const hash = Object.entries(hashes).find(
        ([, v]) => v === String(session.service_session_id),
      )?.[0];

      if (hash) toDelete.push(hash);
    }
  }
  // attempt to delete all ghost keys
  // this is to prevent memory leak
  // filter out all values that are not found in service_sessions
  const serviceSessionIds = new Set(service_sessions.map((s) => s.service_session_id));
  const ghost = Object.entries(hashes).filter(([, v]) => !serviceSessionIds.has(Number(v)));
  toDelete.push(...ghost.map(([k]) => k));
  // remove them all
  if (toDelete.length > 0) {
    const operations = toDelete.map((k) => redisClient.hDel('service_session', k));
    await Promise.all(operations);
  }
});

schedule('0 0 0 */1 * *', async () => {
  // this is mounted on the host machine -- see docker compose file
  const path = '/tmp/dump';
  if (!existsSync(path)) mkdirSync(path);

  // remove all files older than 7 days
  await $`find ${path} -type f -mtime +7 -exec rm {} +`;

  const d = new Date();
  const fmted = `interapp_db_${d.toLocaleDateString('en-GB').replace(/\//g, '_')}`;

  const newFile = `${path}/${fmted}.sql`;
  await $`touch ${newFile}`;
  await $`PGPASSWORD=postgres pg_dump -U postgres -a interapp -h interapp-postgres > ${newFile}`;

  console.info('db snapshot taken at location: ', newFile);
});

// Minio backup task
const requiredEnv = [
  'MINIO_ENDPOINT',
  'MINIO_ADDRESS',
  'MINIO_ROOT_USER',
  'MINIO_ROOT_PASSWORD',
  'MINIO_BUCKETNAME',
];
const missingEnv = requiredEnv.filter((env) => !process.env[env]);
if (missingEnv.length > 0) {
  console.error('Missing required environment variables: ', missingEnv);
  process.exit(1);
}

// define minio variables
const minioURL = `http://${process.env.MINIO_ENDPOINT}${process.env.MINIO_ADDRESS}`;
const minioAccessKey = process.env.MINIO_ROOT_USER as string;
const minioSecretKey = process.env.MINIO_ROOT_PASSWORD as string;
const minioBucketName = process.env.MINIO_BUCKETNAME as string;
const minioAliasName = 'minio';

const minioBackupTask = schedule(
  '0 0 0 */1 * *',
  async () => {
    const path = '/tmp/minio-dump';
    if (!existsSync(path)) mkdirSync(path);
    // remove all files older than 7 days
    await $`find ${path} -type f -mtime +7 -exec rm {} +`;

    const d = new Date();
    const fmted = `interapp_minio_${d.toLocaleDateString('en-GB').replace(/\//g, '_')}`;
    const newFile = `${path}/${fmted}.tar.gz`;

    await $`mc mirror ${minioAliasName}/${minioBucketName} /tmp/minio-dump/temp`;
    await $`cd /tmp && tar -cvf ${newFile} minio-dump/temp`;
    await $`rm -rf /tmp/minio-dump/temp`;
  },
  { scheduled: false },
);

// set minio alias to allow mc to access minio server
await $`mc alias set ${minioAliasName} ${minioURL} ${minioAccessKey} ${minioSecretKey}`;
minioBackupTask.start();
