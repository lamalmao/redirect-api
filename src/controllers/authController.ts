import { Request, Response } from 'express';
import AuthMechanism from '../modules/token-provider.js';
import User from '../models/users.js';

interface AuthData {
  authToken: string;
}

export default async function authController(
  req: Request<unknown, unknown, AuthData>,
  res: Response,
  next: CallableFunction
) {
  const unparsedToken = req.body.authToken;
  const token = AuthMechanism.verify(unparsedToken);

  if (token === null) {
    res.locals.auth = false;
    res.statusCode = 401;
    res.locals.answer.body = {
      message: "Token isn't valid",
      success: false
    };
  }

  const user = await User.findOne(
    {
      _id: token
    },
    {
      status: 1,
      role: 1
    }
  );

  if (user) {
    res.locals.auth = true;
    res.locals.user = user;
  } else {
    res.locals.auth = false;
  }

  next();
}
