import { Record } from 'immutable';
import { IGroup} from '../../Store';

const GroupClass = Record({
  GroupID: '',
  Name: '',
  FounderID: '',
  OwnerRoleID: ''
})

export class Group extends GroupClass implements IGroup {
  GroupID: string
  Name: string
  FounderID: string
  OwnerRoleID: string

  set(key: string, value: string): Group {
    return <Group>super.set(key, value);
  }
}