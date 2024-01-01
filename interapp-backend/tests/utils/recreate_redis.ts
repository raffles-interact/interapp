import redisClient from "@utils/init_redis";

export const recreateRedis = async () => {
  await redisClient.FLUSHALL();
};