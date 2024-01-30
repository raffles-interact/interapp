import redisClient from '@utils/init_redis';

export const recreateRedis = async () => {
  await redisClient.FLUSHALL();
  const k = await redisClient.keys('*');
  if (k.length !== 0) {
    await recreateRedis();
  }
};
