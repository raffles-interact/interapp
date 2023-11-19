import { Router } from 'express';
import { hello } from '@models/hello';
import { verifyJWT, verifyRequiredRole } from '../middleware';
import { UserModel } from '@models/user';

const helloRouter = Router();

helloRouter.get('/', async (req, res) => {
  const helloWorld = await hello();
  res.send(JSON.stringify(helloWorld));
});

export default helloRouter;
