import mongoose from 'mongoose';
import config from 'config';
import server from './server/index.js';
import { MODE } from './settings.js';
import AuthMechanism from './modules/token-provider.js';

mongoose.connect(config.get('dbAuth'));
AuthMechanism.load('HS512', '7d');

const serverProperties: {
  hostname: string;
  port: {
    dev: number;
    prod: number;
  };
} = config.get('host');

const port = serverProperties.port[MODE === 'DEVELOPMENT' ? 'dev' : 'prod'];
server.listen(port, serverProperties.hostname, () => {
  console.log(`Server started in ${MODE} mode and listening on ${serverProperties.hostname}:${port}`);
});
