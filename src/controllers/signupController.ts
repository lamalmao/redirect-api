import { Request, Response } from 'express';
import User from '../models/users.js';
import { BOT_NAME, MODE } from '../settings.js';
import { mailService } from '../modules/mail-service.js';
import Code from '../models/codes.js';
import logger from '../logger.js';

export interface IRequestSignupData {
  username: string;
  email?: string;
  telegramAuth: boolean;
  password: string;
}

export interface IResponseSignupData {
  success: boolean;
  telegramVerificationURL?: string;
  message?: string;
}

export default async function signupController(
  req: Request<unknown, unknown, IRequestSignupData>,
  res: Response<IResponseSignupData>,
  next: CallableFunction
) {
  const data = req.body;
  if (!data.telegramAuth && !data.email) {
    res.locals.answer.body = {
      success: false,
      code: 401,
      message: 'No mail or telegram provided'
    };
    next();
    return;
  }

  const check = await User.exists({
    username: data.username
  });
  if (check) {
    res.locals.answer.body = {
      code: 401,
      success: false,
      message: 'User already exists'
    };
    next();
    return;
  }

  const user = new User({
    username: data.username,
    email: data?.email
  });

  try {
    user.setPassword(data.password);
  } catch (e) {
    res.locals.answer.body = {
      code: 401,
      success: false,
      message: 'Password is not valid'
    };
    next();
    return;
  }

  user.isNew = true;
  try {
    await user.save();
  } catch (e) {
    res.locals.answer.body = {
      code: 500,
      success: false,
      message: e
    };
    next();
    return;
  }

  const code = new Code({
    user: user._id
  });
  await code.save();
  const telegramVerificationURL = data.telegramAuth ? `https://t.me/${BOT_NAME}?start=${user._id}` : undefined;

  if (data.email && !data.telegramAuth) {
    mailService.sendVerificationMail(data.email, user.username, code.verificationLink()).catch((err) => {
      if (MODE === 'DEVELOPMENT') {
        console.log(`Something went wrong while sending email to ${data.email}`);
      }
      logger.error(err);
    });
  }

  res.locals.answer.body = {
    code: 200,
    success: true,
    telegramVerificationURL
  };

  next();
}
