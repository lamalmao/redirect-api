import { Types } from 'mongoose';
import { JWT_KEY } from '../settings.js';
import jsonwebtoken from 'jsonwebtoken';

export default abstract class AuthMechanism {
  private static key: string;
  private static algorithm: jsonwebtoken.Algorithm;
  private static lifeTime: string;

  public static load(algorithm: jsonwebtoken.Algorithm, lifeTime: string): void {
    this.key = JWT_KEY;
    this.algorithm = algorithm;
    this.lifeTime = lifeTime;
  }

  public static sign(userId: Types.ObjectId) {
    return jsonwebtoken.sign(
      {
        userId
      },
      this.key,
      {
        algorithm: this.algorithm,
        expiresIn: this.lifeTime
      }
    );
  }

  public static verify(token: string): Types.ObjectId | null {
    const check = jsonwebtoken.verify(token, this.key, {
      algorithms: [this.algorithm]
    });

    if (typeof check === 'string') {
      return null;
    }

    return check['userId'] as Types.ObjectId;
  }
}
