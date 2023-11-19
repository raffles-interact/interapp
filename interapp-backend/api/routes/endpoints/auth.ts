import { Router } from 'express';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { validateRequiredFields, verifyJWT } from '../middleware';
import { AuthModel } from '@models/auth';

const authRouter = Router();

authRouter.post(
  '/signup',
  validateRequiredFields(['userId', 'username', 'email', 'password']),
  async (req, res) => {
    if (typeof req.body.userId !== 'number') {
      throw new HTTPError(
        'Invalid field type',
        'userId must be a number',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

    // test if school email
    const emailRegex = new RegExp(process.env.SCHOOL_EMAIL_REGEX as string);
    if (emailRegex.test(req.body.email)) {
      throw new HTTPError(
        'Invalid email',
        'Email cannot be a valid school email',
        HTTPErrorCode.BAD_REQUEST_ERROR,
      );
    }

    await AuthModel.signUp(req.body.userId, req.body.username, req.body.email, req.body.password);
    res.status(204).send();
  },
);

authRouter.post('/signin', validateRequiredFields(['username', 'password']), async (req, res) => {
  const { token, refresh } = await AuthModel.signIn(req.body.username, req.body.password);
  res.cookie('refresh', refresh, {
    httpOnly: true,
    path: '/api/auth/refresh',
  });
  res.status(200).send({
    jwt: token,
  });
});

authRouter.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refresh;
  const { token, refresh } = await AuthModel.getNewAccessToken(refreshToken);
  res.cookie('refresh', refresh, {
    httpOnly: true,
    path: '/api/auth/refresh',
  });
  res.status(200).send({
    jwt: token,
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
