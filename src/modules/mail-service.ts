import nodemailer from 'nodemailer';
import logger from '../logger.js';
import config from 'config';

interface IMailAuthData {
  host: string;
  port: number;
  auth: {
    user: string;
    password: string;
  };
}

class MailService {
  private transporter: nodemailer.Transporter;
  private mail: string;

  public constructor(authData: IMailAuthData) {
    this.transporter = nodemailer.createTransport(authData);
    this.mail = authData.auth.user;
  }

  public async sendVerificationMail(to: string, username: string, link: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        to,
        from: this.mail,
        subject: 'Email verification',
        html: `<p>Hello, <b>${username}</b>!\n\nHere's your <a href="${link}">link</a> for account verification<p><br><p>In case of problems with link copy put it to browser: ${link}</p>`
      });
      return true;
    } catch (e) {
      logger.error(e);
      return false;
    }
  }
}

const auth: IMailAuthData = config.get('mail');
export const mailService = new MailService(auth);
