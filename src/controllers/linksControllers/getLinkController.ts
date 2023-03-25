import { Request, Response } from 'express';
import Link from '../../models/links.js';
import logger from '../../logger.js';

interface GetLinkData {
  c: string; // code
}

export default async function getLinkController(
  req: Request<GetLinkData, unknown, unknown>,
  res: Response,
  next: CallableFunction
) {
  const data = req.query;
  const link = await Link.findOne({
    shortCode: data.c
  });

  link
    ?.registerTransition({
      date: new Date(),
      ip: req.ip,
      client: req.headers['user-agent']
    })
    .catch((err) => logger.error(err));

  if (!link || !link.enabled) {
    res.statusCode = 404;
    res.locals.answer.body = {
      message: 'Not found',
      success: false
    };
    next();
    return;
  }

  const url = link.url();
  res.locals.answer.body = {
    url
  };
  res.redirect(url);
  res.locals.sent = true;
  next();
}
