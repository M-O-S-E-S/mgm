import { Record } from 'immutable';
import { IUser } from '../../Types';

const UserClass = Record({
  UUID: '',
  username: '',
  lastname: '',
  email: '',
  godLevel: 0,
  created: new Date(),
  partner: ''
})

export class User extends UserClass implements IUser {
  readonly UUID: string
  readonly username: string
  readonly lastname: string
  readonly email: string
  readonly godLevel: number
  readonly created: Date
  readonly partner: string

  set(key: string, value: string | number): User {
    return <User>super.set(key, value);
  }

  name(): string {
    return this.username + ' ' + this.lastname;
  }

  isAdmin(): boolean {
    return this.godLevel >= 250;
  }

  isSuspended(): boolean {
    return this.godLevel < 1;
  }

  authenticate(password: string): boolean {
    throw new Error('Authentication nut supported client-side');
  }
}