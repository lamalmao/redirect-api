import winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.errors(),
  defaultMeta: {
    service: 'api'
  },
  transports: [new winston.transports.File({ filename: 'errors.log' })]
});
export default logger;
