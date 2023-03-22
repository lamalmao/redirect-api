import { pinoHttp } from 'pino-http';
import { pino } from 'pino';
import path from 'path';
import { MODE, PROCESS_DIR } from './settings.js';

const transport = pino.transport({
  targets: [
    {
      target: path.join(PROCESS_DIR, 'logs', 'story.dev.log'),
      level: 'debug',
      options: {},
    },
    {
      target: path.join(PROCESS_DIR, 'logs', 'errors.log'),
      level: 'error',
      options: {},
    },
  ],
});

const logger = pinoHttp({
  transport: transport,
  quietReqLogger: MODE === 'PRODUCTION',
});

export default logger;
