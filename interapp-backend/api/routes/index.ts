import express from 'express';
import helloRouter from './hello';
import authRouter from './auth';
import 'express-async-errors';
import cors from 'cors';
import { handleError } from './middleware';
import { serve, setup } from 'swagger-ui-express';
import swagger_docs from './swagger_docs.json' assert { type: 'json' };

const app = express();
const PORT = Number(process.env.API_PORT);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use('/api/docs', serve, setup(swagger_docs));
app.use('/api/hello', helloRouter);
app.use('/api/auth', authRouter);

app.use(handleError);

try {
  app.listen(PORT, () => console.log('Server running on port 8000!'));
} catch (err) {
  console.error(err);
  process.exit(1);
}
