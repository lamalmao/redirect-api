import { Request, Response } from 'express';
import { IUser } from '../../models/users.js';
import Link from '../../models/links.js';

interface CreateLinkRequest {
  link: {
    target: string;
    enabled?: boolean;
  };
}

export default async function createLinkController(
  req: Request<unknown, unknown, CreateLinkRequest>,
  res: Response,
  next: CallableFunction
) {
  if (!res.locals.auth) {
    next();
    return;
  }

  const user: IUser = res.locals.user;
  if (user.status !== 'activated') {
    res.locals.answer.code = 402;
    res.locals.answer.body = {
      success: false,
      message: 'Not allowed to perform this action'
    };
    next();
    return;
  }

  const data = req.body.link;
  const url = new URL(data.target);
  const link = new Link({
    createdBy: user?._id,
    target: {
      pathname: url.pathname,
      host: url.host,
      hostname: url.hostname,
      href: url.href,
      port: url.port,
      protocol: url.protocol
    },
    enabled: data?.enabled
  });

  try {
    const savedLink = await link.save();
    res.locals.answer.body = {
      shortUrl: savedLink.shortUrl(),
      success: true,
      id: savedLink._id
    };
    res.locals.answer.code = 200;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    res.locals.answer.code = 400;
    res.locals.answer.body = {
      success: false,
      message: err.message
    };
  }

  next();
}
