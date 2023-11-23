import express from 'express';
import helloRouter from './endpoints/hello';
import authRouter from './endpoints/auth';
import userRouter from './endpoints/user';
import serviceRouter from './endpoints/service';

import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { handleError } from './middleware';
import { serve, setup } from 'swagger-ui-express';
import swagger_docs from './swagger_docs.json' assert { type: 'json' };

const app = express();
const PORT = Number(process.env.API_PORT);

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(cookieParser());

app.use('/api/docs', serve, setup(swagger_docs));
app.use('/api/hello', helloRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/service', serviceRouter);

app.use(handleError);

try {
  app.listen(PORT, () => console.log('Server running on port 8000!'));
} catch (err) {
  console.error(err);
  process.exit(1);
}
