import { Router } from 'express';
import { HTTPError, HTTPErrorCode } from '@utils/errors';
import { validateRequiredFields, verifyJWT } from './middleware';
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

    const token = await AuthModel.signUp(
      req.body.userId,
      req.body.username,
      req.body.email,
      req.body.password,
    );
    res.send(token);
  },
);

authRouter.post('/signin', validateRequiredFields(['username', 'password']), async (req, res) => {
  const token = await AuthModel.signIn(req.body.username, req.body.password);
  res.send(token);
});

authRouter.patch(
  '/changepassword',
  validateRequiredFields(['oldPassword', 'newPassword']),
  verifyJWT,
  async (req, res) => {
    const jwt = req.body.user.payload;
    const token = await AuthModel.changePassword(
      jwt.username,
      req.body.oldPassword,
      req.body.newPassword,
    );
    res.send(token);
  },
);

export default authRouter;
