import express from 'express';
import helloRouter from './endpoints/hello';
import authRouter from './endpoints/auth';
import userRouter from './endpoints/user';
import serviceRouter from './endpoints/service';
import announcementRouter from './endpoints/announcement';

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
app.use(cors());
app.use(cookieParser());

process.env.NODE_ENV === 'development' && app.use('/api/docs', serve, setup(swagger_docs));

app.use('/api/hello', helloRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/service', serviceRouter);
app.use('/api/announcement', announcementRouter);

app.use(handleError);
app.use(generateRateLimit(1000 * 60 * 60, 500)); // 500 requests per hour

try {
  app.listen(PORT, () => console.log('Server running on port 8000!'));
} catch (err) {
  console.error(err);
  process.exit(1);
}
