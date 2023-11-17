import { Router } from 'express';
import { hello } from '@models/hello';
import { verifyJWT, verifyRequiredRole } from './middleware';
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

helloRouter.get('/protected', verifyJWT, verifyRequiredRole(1), async (req, res) => {
  res.send(req.body.user);
});

export default helloRouter;
