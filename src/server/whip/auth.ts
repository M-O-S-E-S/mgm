
import { RequestCodes } from './types';
var sha1 = require('sha1');

export class AuthChallenge {
  challenge: Buffer

  constructor(data: Buffer) {
    if (data[0] !== RequestCodes.AuthChallenge)
      throw new Error('Invalid type for Auth Challenge');
    this.challenge = data.slice(1, 8)
  }
}

export class AuthResponse {
  response: Buffer

  constructor(password: string, challenge: AuthChallenge) {
    this.response = Buffer.concat(
      [
        new Buffer([RequestCodes.AuthChallenge]),
        new Buffer(sha1(password + challenge.challenge))
      ]
      );
  }
}

export class AuthConfirmation {
  success: boolean

  constructor(data: Buffer) {
    if (data[0] !== RequestCodes.AuthResponse)
      throw new Error('Invalid type for Auth Confirmation');
    if (data[1] === 0)
      this.success = true;
  }
}
