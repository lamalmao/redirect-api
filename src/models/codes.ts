import { Schema, SchemaTypes, Types, model } from 'mongoose';
import crypto from 'crypto';
import User from './users.js';
import logger from '../logger.js';
import { HOST_LINK } from '../settings.js';

export type appointment = 'verification' | 'modification';

interface IUserCode {
  value: string;
  user: Types.ObjectId;
  activeUntil: Date;
  active: boolean;
  created: Date;
  appointment: appointment;

  activate(): Promise<boolean>;
  verificationLink(): string;
}

const CODE_LIFETIME = 1 * 60 * 60 * 1000; // 1 hour

const UserCodeSchema = new Schema<IUserCode>(
  {
    value: {
      type: String,
      required: true,
      default: crypto.randomBytes(64).toString('hex')
    },
    user: {
      required: true,
      type: SchemaTypes.ObjectId,
      validate: {
        validator: async (userId: Types.ObjectId): Promise<boolean> => {
          const check = await User.exists({
            _id: userId
          });
          return check !== null;
        },
        message: "User doesn't exist"
      }
    },
    activeUntil: {
      type: Date,
      required: true,
      default: new Date(Date.now() + CODE_LIFETIME)
    },
    active: {
      type: Boolean,
      required: true,
      default: true
    },
    created: {
      type: Date,
      required: true,
      default: new Date()
    },
    appointment: {
      type: String,
      required: true,
      enum: {
        values: ['verification', 'modification'],
        message: 'Unknown code appointment "${VALUE}"'
      },
      default: 'verification'
    }
  },
  {
    methods: {
      async activate(): Promise<boolean> {
        const user = await User.findOne(
          {
            _id: this.user
          },
          {
            status: 1
          }
        );

        if (!user) {
          return false;
        }

        if (this.appointment === 'verification' && user.status !== 'pending') {
          return false;
        }

        if (this.appointment === 'verification') {
          user.status = 'activated';
          user.save().catch((err) => logger.error(err));
        }

        this.active = false;
        this.save().catch((err) => logger.error(err));

        return true;
      },
      verificationLink(): string {
        return HOST_LINK + '/activate?q=' + this.value;
      }
    }
  }
);

const Code = model('codes', UserCodeSchema);
export default Code;
