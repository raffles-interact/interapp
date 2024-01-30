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
  app.listen(PORT, () => console.log('Server running on port 8000!'));
} catch (err) {
  console.error(err);
  process.exit(1);
}
