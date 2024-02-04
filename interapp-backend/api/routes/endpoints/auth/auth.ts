import { Router } from 'express';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { validateRequiredFieldsV2, verifyJWT } from '../../middleware';
import { SignupFields, SigninFields } from './validation';
import { AuthModel } from '@models/auth';
import { z } from 'zod';

const authRouter = Router();

authRouter.post('/signup', validateRequiredFieldsV2(SignupFields), async (req, res) => {
  const body: z.infer<typeof SignupFields> = req.body;

  await AuthModel.signUp(body.user_id, body.username, body.email, body.password);
  res.status(201).send();
});

authRouter.post('/signin', validateRequiredFieldsV2(SigninFields), async (req, res) => {
  const body: z.infer<typeof SigninFields> = req.body;
  const { token, refresh, user, expire } = await AuthModel.signIn(body.username, body.password);
  res.cookie('refresh', refresh, {
    httpOnly: true,
    path: '/api/auth/refresh',
  });
  res.status(200).send({
    access_token: token,
    user: user,
    expire: expire,
  });
});

authRouter.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refresh;
  const { token, refresh, expire } = await AuthModel.getNewAccessToken(refreshToken);
  res.cookie('refresh', refresh, {
    httpOnly: true,
    path: '/api/auth/refresh',
  });
  res.status(200).send({
    access_token: token,
    expire: expire,
  });
});

authRouter.delete('/signout', verifyJWT, async (req, res) => {
  await AuthModel.signOut(
    req.headers.username as string,
    req.headers.authorization?.split(' ')[1] as string,
  );
  res.clearCookie('refresh', { path: '/api/auth/refresh' });
  res.status(204).send();
});

export default authRouter;
