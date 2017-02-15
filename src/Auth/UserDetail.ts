
import { User } from '../Store';
import { Set } from 'immutable';

/**
 * The user detail is the body of the JWT tokens.
 * Nothing secret or secure should be in here.
 * 
 * This token also contains the estate IDs and region UUIDs that they have permission over.
 */
export interface UserDetail {
  name: string
  uuid: string
  isAdmin: boolean
  email: string
  estates: Set<number>
  regions: Set<string>
}
