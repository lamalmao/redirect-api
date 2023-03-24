import express from 'express';
import https from 'https';
import fs from 'fs';
import { MODE, PROCESS_DIR } from '../settings.js';
import path from 'path';
import mainRouter from '../routers/mainRouter.js';
import logger from '../logger.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { EventEmitter } from 'events';

const app = express();

const server = https.createServer(
  {
    key: fs.readFileSync(path.join(PROCESS_DIR, 'key.pem')).toString(),
    cert: fs.readFileSync(path.join(PROCESS_DIR, 'cert.pem')).toString()
  },
  app
);

app.use(
  cors({
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.on('error', (err) => {
  logger.error(err);
});

declare global {
  var debugLoggerConnections: Map<string, [string, string, string, number]>;
  var debugLoggerEventEmitter: EventEmitter;
}

if (MODE === 'DEVELOPMENT') {
  global.debugLoggerEventEmitter = new EventEmitter();
  global.debugLoggerConnections = new Map();
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
        `${connectionDebugData[1]} request to ${connectionDebugData[0]} from ${connectionDebugData[2]}\tprocessed for ${
          Date.now() - connectionDebugData[3]
        }ms`
      );
      debugLoggerConnections.delete(connectionId);
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
