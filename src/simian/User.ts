

import { User, Credential } from '../halcyon/User';
import { UUIDString } from '../halcyon/UUID';

export class SimUser implements User {
  id: UUIDString
  fname: string
  lname: string
  email: string
  hash: Credential
  godlevel: number

  constructor(id: UUIDString, fname: string, lname: string, email: string, hash: Credential, godlevel: number, enabled: boolean) {
    this.id = id;
    this.fname = fname;
    this.lname = lname;
    this.email = email;
    this.hash = hash;
    this.godlevel = godlevel;
    if (godlevel === 0 && enabled) {
      this.godlevel = 1;
    }
  }

  getUUID(): UUIDString {
    return this.id;
  }
  getUsername(): string {
    return this.fname;
  }
  getLastName(): string {
    return this.lname;
  }
  getEmail(): string {
    return this.email;
  }
  setEmail(email: string): Promise<User> { return Promise.reject(new Error('SimUser is not fully implemented')) }
  getGodLevel(): number {
    return this.godlevel;
  }
  setGodLevel(level: number): Promise<User> { return Promise.reject(new Error('SimUser is not fully implemented')) }
  getCredential(): Credential {
    return this.hash;
  }
  setCredential(cred: Credential): Promise<User> { return Promise.reject(new Error('SimUser is not fully implemented')) }
  templateOnto(firstname: string, lastname: string, password: Credential, email: string): Promise<any> { return Promise.reject(new Error('SimUser is not fully implemented')) }
}
