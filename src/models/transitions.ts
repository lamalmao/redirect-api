import { Schema, model } from 'mongoose';

export interface TransitionData {
  ip: string;
  client?: string;
  date: Date;
  success?: boolean;
  target?: string;
}

const TransitionSchema = new Schema<TransitionData>({
  ip: {
    type: String,
    required: true,
    validate: {
      validator: (ip: string) => /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(ip),
      message: 'Not valid ip'
    }
  },
  client: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  target: {
    type: String,
    required: true
  }
});

const Transition = model('transitions', TransitionSchema);

export default Transition;
