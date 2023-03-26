import { Schema, SchemaTypes, Types, model } from 'mongoose';
import { Url } from 'url';
import { randomBytes } from 'crypto';
import Transition, { TransitionData } from './transitions.js';
import { HOST_LINK } from '../settings.js';

interface ILink {
  target: Url;
  enabled: boolean;
  createdBy: Types.ObjectId;
  created: Date;
  shortCode: string;

  registerTransition(transition: TransitionData): Promise<void>;
  url(): string;
  shortUrl(): string;
}

const UrlSchema = new Schema({
  pathname: String,
  host: String,
  hostname: String,
  href: {
    required: true,
    type: String
  },
  port: Number,
  protocol: String
});

const LinkSchema = new Schema<ILink>(
  {
    target: {
      type: UrlSchema,
      required: true
    },
    enabled: {
      type: Boolean,
      required: true,
      default: true
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      default: () => randomBytes(6).toString('base64url')
    },
    createdBy: {
      type: SchemaTypes.ObjectId,
      required: true
    },
    created: {
      type: Date,
      required: true,
      default: new Date()
    }
  },
  {
    methods: {
      async registerTransition(data: TransitionData): Promise<void> {
        data.success = this.enabled;
        data.target = this.shortCode;
        const transition = new Transition(data);
        await transition.save();
      },
      url(): string {
        return this.target.href;
      },
      shortUrl(): string {
        return HOST_LINK + '/s?c=' + this.shortCode;
      }
    }
  }
);

const Link = model('links', LinkSchema);

export default Link;
