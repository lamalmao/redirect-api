import express from 'express';
import https from 'https';
import config from 'config';
import fs from 'fs';
import { MODE, PROCESS_DIR } from '../settings.js';
import path from 'path';
import mainRouter from '../routers/main-router.js';
import logger from '../logger.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

const options: {
  key: string;
  cert: string;
} = config.get('credentials');
const server = https.createServer(
  {
    key: fs.readFileSync(path.join(PROCESS_DIR, options.key)).toString(),
    cert: fs.readFileSync(path.join(PROCESS_DIR, options.cert)).toString(),
  },
  app,
);

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(logger);

if (MODE === 'DEVELOPMENT') {
  app.use(async (req, _, next) => {
    const then = Date.now();
    await next();
    const delay = Date.now() - then;
    req.log.debug(req.body, `${req.url}\t${req.method} request from ${req.ip}\t| ${delay}ms`);
  });
}

app.use('/api', mainRouter);
export default server;
