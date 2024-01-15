import minioClient, { createBucket } from '@utils/init_minio';

export const recreateMinio = async () => {
  try {
    const stream = await minioClient.listObjects(process.env.MINIO_BUCKETNAME as string);
    stream.on('data', async (obj) => {
      if (obj.name)
        await minioClient.removeObject(process.env.MINIO_BUCKETNAME as string, obj.name);
    });
    stream.on('error', (e) => console.error(e));
    stream.on('end', async () => {
      await minioClient.removeBucket(process.env.MINIO_BUCKETNAME as string);
      await createBucket();
    });
  } catch (e) {
    console.error(e);
  }
};
