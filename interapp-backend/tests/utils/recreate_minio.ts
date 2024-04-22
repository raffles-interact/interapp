import minioClient, { createBucket } from '@utils/init_minio';

export const recreateMinio = async () => {
  try {
    const stream = await minioClient.listObjectsV2(
      process.env.MINIO_BUCKETNAME as string,
      undefined,
      true,
    );

    await new Promise<void>((resolve, reject) => {
      const deletePromises: Promise<void>[] = [];

      stream.on('data', (obj) => {
        if (obj.name) {
          const deletePromise = minioClient.removeObject(
            process.env.MINIO_BUCKETNAME as string,
            obj.name,
          );
          deletePromises.push(deletePromise);
        }
      });
      stream.on('error', (e) => {
        console.error(e);
        reject(e);
      });
      stream.on('end', async () => {
        try {
          await Promise.all(deletePromises);
          await minioClient.removeBucket(process.env.MINIO_BUCKETNAME as string);
          await createBucket();
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  } catch (e) {
    console.error(e);
  }
};
