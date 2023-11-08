import { Router } from 'express';
import { hello } from '@service/hello_world/hello';

const helloRouter = Router();

helloRouter.get('/', async (req, res) => {
  const helloWorld = await hello();
  res.send(JSON.stringify(helloWorld));
});

export default helloRouter;
