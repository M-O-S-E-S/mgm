import { Record } from 'immutable';
import { IPendingUser } from '../../Types';

const PendingUserClass = Record({
  name: '',
  email: '',
  gender: '',
  registered: '',
  summary: ''
})

export class PendingUser extends PendingUserClass implements IPendingUser {
  name: string
  email: string
  gender: string
  registered: string
  password: string
  summary: string

  set(key: string, value: string): PendingUser {
    return <PendingUser>super.set(key, value);
  }
}