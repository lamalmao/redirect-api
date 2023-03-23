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
import { EventEmitter } from 'stream';

const app = express();

const options: {
  key: string;
  cert: string;
} = config.get('credentials');
const server = https.createServer(
  {
    key: fs.readFileSync(path.join(PROCESS_DIR, options.key)).toString(),
    cert: fs.readFileSync(path.join(PROCESS_DIR, options.cert)).toString()
  },
  app
);

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(logger);

declare global {
  let debugLoggerConnections: Map<string, [string, string, string, number]>;
  let debugLoggerEventEmitter: EventEmitter;
}

if (MODE === 'DEVELOPMENT') {
  debugLoggerEventEmitter = new EventEmitter();
  debugLoggerConnections = new Map();
  app.use(async (req, res, next) => {
    const then = Date.now();
    const connectionId = crypto.randomUUID();
    res.locals['connectionId'] = connectionId;
    debugLoggerConnections.set(connectionId, [req.url, req.method, req.ip, then]);
    next();
  });

  debugLoggerEventEmitter.on('connectionClosed', (connectionId: string) => {
    try {
      const connectionDebugData = debugLoggerConnections.get(connectionId);
      if (!connectionDebugData) {
        return;
      }

      console.log(
        `${connectionDebugData[1]} request to ${connectionDebugData[0]} from ${connectionDebugData[2]}\tprocessed for ${connectionDebugData[3]}ms`
      );
    } catch (e) {}
  });
}

app.use((_, res, next) => {
  res.locals.answer = {
    code: 200,
    body: {}
  };

  next();
});
app.use('/api', mainRouter);
app.use((_, res) => {
  res.statusCode = res.locals.answer.code;
  res.json(res.locals.answer.body);

  debugLoggerEventEmitter?.emit('connectionClosed', res.locals.connectionId);
});

export default server;
