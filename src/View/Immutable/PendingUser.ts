import { Record } from 'immutable';
import { IPendingUser } from '../../Types';

const PendingUserClass = Record({
  name: '',
  email: '',
  gender: '',
  registered: new Date(),
  summary: ''
})

export class PendingUser extends PendingUserClass implements IPendingUser {
  name: string
  email: string
  gender: string
  registered: Date
  password: string
  summary: string

  set(key: string, value: string | Date): PendingUser {
    return <PendingUser>super.set(key, value);
  }
}