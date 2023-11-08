import express from 'express';
import helloRouter from './hello';

const app = express();
const PORT = Number(process.env.API_PORT);

app.use('/api/hello', helloRouter);

app.listen(PORT, () => console.log('Server running on port 8000!'));
