import { Router } from 'express';
import { hello } from '@models/.';

const helloRouter = Router();

helloRouter.get('/', async (req, res) => {
  const helloWorld = await hello();
  res.send(JSON.stringify(helloWorld));
});

export default helloRouter;
