import { Client } from 'minio';

const config = {
  accessKey: process.env.MINIO_ACCESSKEY,
  secretKey: process.env.MINIO_SECRETKEY,
  bucketName: process.env.MINIO_BUCKETNAME,
  endpoint: process.env.MINIO_ENDPOINT,
};

if (Object.values(config).some((x) => x === undefined)) {
  console.log('Minio env vars not set');
  process.exit(1);
}

const minioClient = new Client({
  endPoint: config.endpoint as string,
  port: 9000,
  accessKey: config.accessKey as string,
  secretKey: config.secretKey as string,
  useSSL: false,
});
export async function createBucket() {
  const exists = await minioClient.bucketExists(config.bucketName as string);
  if (!exists) {
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Action: ['s3:GetObject'],
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Resource: [`arn:aws:s3:::${config.bucketName as string}/*`],
          Sid: '',
        },
      ],
    });
    await minioClient.makeBucket(config.bucketName as string, 'ap-southeast-1');
    await minioClient.setBucketPolicy(config.bucketName as string, policy);
  }
}

await createBucket();

export default minioClient;
