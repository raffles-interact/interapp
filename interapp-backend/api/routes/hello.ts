import { Router } from 'express';
import { hello } from '@models/hello';
import { UserModel } from '@models/user';

const helloRouter = Router();

helloRouter.get('/', async (req, res) => {
  const helloWorld = await hello();
  res.send(JSON.stringify(helloWorld));
});

helloRouter.get('/world', async (req, res) => {
  const userMeta = await UserModel.getUserMetadata(1);
  res.send(JSON.stringify(userMeta));
});

export default helloRouter;
