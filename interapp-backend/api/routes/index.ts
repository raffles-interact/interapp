import express from 'express';
import helloRouter from './hello';
import 'express-async-errors';
import { Request, Response, NextFunction } from 'express';
import { HTTPError } from '@utils/errors';

const app = express();
const PORT = Number(process.env.API_PORT);

app.use('/api/hello', helloRouter);

app.use((err: HTTPError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status);
  res.header(err.headers);
  res.json({
    name: err.name,
    message: err.message,
    data: err.data,
  });

  next(err);
});

app.listen(PORT, () => console.log('Server running on port 8000!'));
