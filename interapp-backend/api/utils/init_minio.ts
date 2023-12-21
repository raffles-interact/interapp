import { Client } from 'minio';

const config = {
  accessKey: process.env.MINIO_ACCESSKEY,
  secretKey: process.env.MINIO_SECRETKEY,
  bucketName: process.env.MINIO_BUCKETNAME,
};

if (Object.values(config).some((x) => x === undefined)) {
  console.log('Minio env vars not set');
  process.exit(1);
}

const minioClient = new Client({
  endPoint: 'localhost',
  port: 9000,
  accessKey: config.accessKey as string,
  secretKey: config.secretKey as string,
  useSSL: false,
});

const exists = await minioClient.bucketExists(config.bucketName as string);
if (!exists) {
  await minioClient.makeBucket(config.bucketName as string);
}

export default minioClient;
