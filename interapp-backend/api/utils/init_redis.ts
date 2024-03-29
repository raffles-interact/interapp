import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err, process.env.REDIS_URL));
try {
  await redisClient.connect();
} catch (err) {
  console.error('Error connecting to redis', err);
  process.exit(1);
}
export default redisClient;
