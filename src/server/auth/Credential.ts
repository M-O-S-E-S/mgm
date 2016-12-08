
import * as crypto from 'crypto';

export class Credential {
  hash: string

  compare(plain: string, salt?: string) {
    return this.hash === Credential.fromPlaintext(plain, salt).hash;
  }

  static fromPlaintext(plain: string, salt?: string): Credential {
    return Credential.fromOpensim(crypto.createHash('md5').update(plain).digest('hex'));
  }

  static fromOpensim(singleHash: string, salt?: string) {
    if (singleHash.slice(0, 3) !== '$1$') {
      singleHash = '$1$' + singleHash;
    }
    let c: Credential = new Credential();
    c.hash = crypto.createHash('md5').update(singleHash.slice(3) + ':' + (salt ? salt : '')).digest('hex');
    return c
  }

  static fromHalcyon(hash: string) {
    let c: Credential = new Credential();
    c.hash = hash
    return c
  }
}