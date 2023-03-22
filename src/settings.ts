import * as dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

export const PROCESS_DIR = process.cwd();

const CONFIG_DIR = path.join(PROCESS_DIR, 'config');
process.env['NODE_CONFIG_DIR'] = CONFIG_DIR;

dotenv.config();

export const MODE: 'DEVELOPMENT' | 'PRODUCTION' =
  process.env['MODE'] === 'PRODUCTION' ? process.env['MODE'] : 'DEVELOPMENT';

const JWT_KEY_FILE = 'jwt_key.txt';
const JWT_KEY_PATH = path.join(PROCESS_DIR, '');

export const JWT_KEY: string = (function () {
  if (fs.existsSync(path.join(PROCESS_DIR, JWT_KEY_FILE))) {
    console.log('JWT key loaded');
    return fs.readFileSync(JWT_KEY_PATH).toString();
  } else {
    const key = crypto.randomBytes(512).toString('hex');
    fs.writeFileSync(JWT_KEY_PATH, key);
    console.log('JWT key created');
    return key;
  }
})();
