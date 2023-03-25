import { Schema, Types, model } from 'mongoose';
import PasswordChecker from '../modules/password-strength-checker.js';
import crypto from 'crypto';

export interface IUser {
  _id?: Types.ObjectId;
  email?: string;
  telegramId?: number;
  status: 'activated' | 'pending' | 'blocked';
  registerDate: Date;
  username: string;
  password: {
    hash: string;
    salt: string;
  };
  role: 'admin' | 'common';

  setPassword(password: string): void;
  comparePassword(password: string): boolean;
}

const userPasswordChecker = new PasswordChecker({
  minLength: 6,
  maxLength: 32,
  mustContain: {
    lowerCase: true,
    upperCase: true,
    number: true,
    special: true
  }
});

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: false,
      validate: {
        validator: (email: string) => {
          return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
            email
          );
        },
        message: '{VALUE} is not valid email'
      }
    },
    telegramId: {
      type: Number,
      required: false
    },
    status: {
      type: String,
      enum: {
        values: ['activated', 'pending', 'blocked'],
        message: '{VALUE} is not valid account status'
      },
      required: true,
      default: 'pending'
    },
    registerDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    username: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (username: string) => {
          return /^[a-z0-9\.\_\-\#\$]{3,}$/i.test(username);
        },
        message: '{VALUE} is not valid username'
      }
    },
    password: {
      hash: {
        type: String
      },
      salt: {
        type: String
      }
      // required: true
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ['admin', 'common'],
        message: 'Unknown role'
      },
      default: 'common'
    }
  },
  {
    methods: {
      setPassword(password: string): void {
        if (!userPasswordChecker.check(password)) {
          throw new Error('Password is not strong enough');
        }

        const salt = crypto.randomBytes(64).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 512, 'sha512').toString('hex');

        this.password = {
          salt,
          hash
        };
      },
      comparePassword(password: string): boolean {
        return (
          this.password.hash === crypto.pbkdf2Sync(password, this.password.salt, 1000, 512, 'sha512').toString('hex')
        );
      }
    }
  }
);

const User = model('users', UserSchema);
export default User;
