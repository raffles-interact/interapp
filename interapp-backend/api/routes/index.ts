// check that all attributes in process env is set
const requiredEnv = [
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'API_PORT',
  'REDIS_URL',
  'FRONTEND_URL',
  'SCHOOL_EMAIL_REGEX',
  'MINIO_ROOT_USER',
  'MINIO_ROOT_PASSWORD',
  'MINIO_ADDRESS',
  'MINIO_CONSOLE_ADDRESS',
  'MINIO_ACCESSKEY',
  'MINIO_SECRETKEY',
  'MINIO_BUCKETNAME',
  'MINIO_ENDPOINT',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRATION',
  'JWT_REFRESH_EXPIRATION',
  'JWT_ISSUER',
  'JWT_AUDIENCE',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
];

const missing = requiredEnv.reduce((acc, curr) => {
  if (process.env[curr] === undefined) acc.push(curr);
  return acc;
}, [] as string[]);

if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}\nBackend will crash now :(`);
  process.exit(1);
}

import express from 'express';
import {
  helloRouter,
  authRouter,
  userRouter,
  serviceRouter,
  announcementRouter,
} from './endpoints';

import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { handleError, generateRateLimit } from './middleware';
import { serve, setup } from 'swagger-ui-express';
import swagger_docs from './swagger_docs.json' assert { type: 'json' };

const app = express();
const PORT = Number(process.env.API_PORT);

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());

if (['development', 'test'].includes(process.env.NODE_ENV ?? '')) {
  app.use('/api/docs', serve, setup(swagger_docs, { swaggerOptions: { validatorUrl: null } }));
}

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.use(generateRateLimit(1000 * 60, 500)); // 500 requests per 1 minute
}

app.use('/api/hello', helloRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/service', serviceRouter);
app.use('/api/announcement', announcementRouter);

app.use(handleError);

try {
  app.listen(PORT, () => console.info(`Server running on port ${PORT}!`));
} catch (err) {
  console.error(err);
  process.exit(1);
}
