import { MODE } from '../settings.js';

interface IOptions {
  mustContain: {
    upperCase: boolean;
    lowerCase: boolean;
    special: boolean;
    number: boolean;
  };
  minLength: number;
  maxLength?: number;
}

export default class PasswordChecker {
  private form: RegExp;

  public constructor(opts: IOptions) {
    const conditions = opts.mustContain;

    let formString = '^';
    formString += conditions.lowerCase ? '(?=.*[a-z])' : '';
    formString += conditions.upperCase ? '(?=.*[A-Z])' : '';
    formString += conditions.number ? '(?=.*\\d)' : '';
    formString += conditions.special ? '(?=.*[!@#$&*\\(\\)\\-\\+])' : '';
    formString += `.{${opts.minLength},${opts.maxLength}}$`;

    this.form = new RegExp(formString);
    if (MODE === 'DEVELOPMENT') {
      console.log(`Password checker RegExp: ${this.form}`);
    }
  }

  public check(password: string): boolean {
    return this.form.test(password);
  }
}
