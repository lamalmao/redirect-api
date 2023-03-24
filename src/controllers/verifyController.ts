import { Request, Response } from 'express';
import Code from '../models/codes.js';
import AuthMechanism from '../modules/token-provider.js';

export interface IRequestVerifyData {
  code: string;
}

export interface IResponseVerifyData {
  success: boolean;
  token?: string;
  message?: string;
}

export async function verifyController(
  req: Request<unknown, unknown, IRequestVerifyData>,
  res: Response<IResponseVerifyData>,
  next: CallableFunction
) {
  const data = req.body;
  const code = await Code.findOne({
    value: data.code,
    active: true,
    activeUntil: {
      $gt: new Date()
    }
  });

  if (!code) {
    res.locals.answer.code = 401;
    res.locals.answer.body = {
      success: false,
      message: 'Code is not valid'
    };
    next();
    return;
  }

  const result = await code.activate();
  if (!result) {
    res.locals.answer.code = 401;
    res.locals.answer.body = {
      success: false,
      message: 'Activation went wrong'
    };
    next();
    return;
  }

  const token = AuthMechanism.sign(code.user);
  res.locals.answer.code = 200;
  res.locals.answer.body = {
    success: true,
    token
  };
  next();
}
