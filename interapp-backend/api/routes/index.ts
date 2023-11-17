import express from 'express';
import helloRouter from './hello';
import authRouter from './auth';
import 'express-async-errors';
import { handleError } from './middleware';

const app = express();
const PORT = Number(process.env.API_PORT);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api/hello', helloRouter);
app.use('/api/auth', authRouter);

app.use(handleError);

app.listen(PORT, () => console.log('Server running on port 8000!'));
