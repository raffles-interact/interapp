import { Router } from 'express';
import { hello } from '@models/hello';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { UserModel } from '@models/user';
import { AuthModel } from '@models/auth';

const helloRouter = Router();

helloRouter.get('/', async (req, res) => {
  const helloWorld = await hello();
  res.send(JSON.stringify(helloWorld));
});

helloRouter.get('/world', async (req, res) => {
  const userMeta = await UserModel.getUserMetadata(1);
  res.send(JSON.stringify(userMeta));
});

helloRouter.post('/world2', async (req, res) => {
  if (!req.body.userId || !req.body.username || !req.body.email || !req.body.password) {
    throw new HTTPError(
      'Missing fields',
      `You are missing these field(s): ${!req.body.userId ? 'userId ' : ''}${
        !req.body.username ? 'username ' : ''
      }${!req.body.email ? 'email ' : ''}${!req.body.password ? 'password ' : ''}`,
      HTTPErrorCode.BAD_REQUEST_ERROR,
    );
  }
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

  const token = await AuthModel.signUp(
    req.body.userId,
    req.body.username,
    req.body.email,
    req.body.password,
  );
  res.send(token);
});

export default helloRouter;
