import express, { urlencoded } from 'express';
import https from 'https';
import fs from 'fs';
import { MODE, PROCESS_DIR } from '../settings.js';
import path from 'path';
import mainRouter from '../routers/mainRouter.js';
import logger from '../logger.js';
import cors from 'cors';
import { EventEmitter } from 'events';
import getLinkController from '../controllers/linksControllers/getLinkController.js';

const app = express();
const ICON = path.join(PROCESS_DIR, 'favicon.ico');

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
app.get('/favicon.ico', (_, res) => res.sendFile(ICON));
app.use(express.json());
app.use(
  urlencoded({
    extended: true
  })
);

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
    global.debugLoggerConnections.set(connectionId, [req.url, req.method, req.ip, then]);
    next();
  });

  global.debugLoggerEventEmitter.on('connectionClosed', (connectionId: string) => {
    try {
      const connectionDebugData = global.debugLoggerConnections.get(connectionId);
      if (!connectionDebugData) {
        return;
      }

      console.log(
        `${connectionDebugData[1]} request to ${connectionDebugData[0]} from ${connectionDebugData[2]}\tprocessed for ${
          Date.now() - connectionDebugData[3]
        }ms`
      );
      global.debugLoggerConnections.delete(connectionId);
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
app.get('/s', getLinkController);
app.use('/api', mainRouter);
app.use((_, res) => {
  if (!res.locals.sent) {
    res.json(res.locals.answer.body);
  }

  if (global.debugLoggerEventEmitter) {
    global.debugLoggerEventEmitter.emit('connectionClosed', res.locals.connectionId);
  }
});

export default server;
