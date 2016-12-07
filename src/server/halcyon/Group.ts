
import { UUIDString } from './UUID';
import { Sql } from '../mysql/sql';
import { User } from './User';

export interface Group {
  getName(): string
  getGroupID(): UUIDString
  getFounder(): UUIDString
  getOwnerRole(): UUIDString
  getMembers(): GroupMembership[]
  getRoles(): GroupRole[]
  addMember(user: User, roleID: UUIDString): Promise<Group>
  removeMember(user: User): Promise<Group>
}

class GroupObj {
  db: Sql
  GroupID: UUIDString
  Name: string
  Charter: string
  InsigniaID: UUIDString
  FounderID: UUIDString
  MembershipFee: number
  OpenEnrollment: number
  ShowInList: number
  AllowPublish: number
  MaturePublish: number
  OwnerRoleID: UUIDString
  Members: GroupMembership[]
  Roles: GroupRole[]

  constructor(db: Sql){
    this.db = db;
  }

  getName(): string {
    return this.Name;
  }

  getGroupID(): UUIDString {
    return this.GroupID;
  }

  getFounder(): UUIDString {
    return this.FounderID;
  }

  getOwnerRole(): UUIDString {
    return this.OwnerRoleID;
  }

  getMembers(): GroupMembership[] {
    return this.Members.slice();
  }

  getRoles(): GroupRole[] {
    return this.Roles.slice();
  }

  removeMember(user: User): Promise<Group> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query(
        'DELETE FROM osgroupmembership WHERE GroupID=? AND AgentID=?',
        [this.GroupID.toString(), user.getUUID().toString()],
        (err, rows: any[]) => {
          if (err)
            return reject(err);
          resolve();
        });
    }).then(() => {
      let index = -1;
      for (let i = 0; i < this.Members.length; i++) {
        if (this.Members[i].AgentID === user.getUUID()) {
          index = i;
        }
      }
      if (index > -1) {
        this.Members = this.Members.splice(index, 1);
      }
    }).then(() => {
      let idx = -1;
      for(let i= 0; i < this.Members.length; i++){
        if(this.Members[i].AgentID === user.getUUID()){
          idx = i;
        }
      }
      this.Members = this.Members.splice(idx,1);
      return this;
    });
  }

  addMember(user: User, roleID: UUIDString): Promise<Group> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query(
        'INSERT INTO osgroupmembership (GroupID, AgentID, SelectedRoleID, Contribution, ListInProfile, AcceptNotices) VALUES (?,?,?,0,1,1)',
        [this.GroupID.toString(), user.getUUID().toString(), roleID.toString()],
        (err, rows: any[]) => {
          if (err)
            return reject(err);
          resolve();
        });
    }).then(() => {
      let gm = new GroupMembership();
      gm.GroupID = this.GroupID;
      gm.AgentID = user.getUUID();
      gm.SelectedRoleID = roleID;
      this.Members.push(gm);
      return this;
    })
  }


}

export class GroupMembership {
  GroupID: UUIDString
  AgentID: UUIDString
  SelectedRoleID: UUIDString
  Contribution: number
  ListInProfile: number
  AcceptNotices: number
}

export class GroupRole {
  GroupID: UUIDString
  RoleID: UUIDString
  Name: string
  Description: string
  Title: string
  Powers: number
}

export class GroupMgr {
  private static _instance: GroupMgr = null;
  private db: Sql
  private groups: { [key: string]: Group } = {};

  constructor(sql: Sql) {
    if (GroupMgr._instance) {
      throw new Error('RegionMgr singleton has already been initialized');
    }
    this.db = sql;
    this.initialize();

    GroupMgr._instance = this;
  }

  public static instance(): GroupMgr {
    return GroupMgr._instance;
  }

  getAllGroups(): Promise<Group[]> {
    let groups: Group[] = [];
    for (let id in this.groups) {
      groups.push(this.groups[id]);
    }
    return Promise.resolve(groups);
  }

  getGroup(id: UUIDString): Promise<Group> {
    if (id.toString() in this.groups) {
      return Promise.resolve(this.groups[id.toString()]);
    }
    return Promise.reject(new Error('Group ' + id.toString() + ' does not exist'));
  }

  private initialize() {
    return new Promise<Group[]>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM osgroup', (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      for (let r of rows) {
        let g = new GroupObj(this.db);
        g.GroupID = new UUIDString(r.GroupID);
        g.Name = r.Name;
        g.Charter = r.Charter;
        g.InsigniaID = new UUIDString(r.InsigniaID);
        g.FounderID = new UUIDString(r.FounderID);
        g.MembershipFee = r.MembershipFee;
        g.OpenEnrollment = r.OpenEnrollment;
        g.ShowInList = r.ShowInList;
        g.AllowPublish = r.AllowPublish;
        g.MaturePublish = r.MaturePublish;
        g.OwnerRoleID = new UUIDString(r.OwnerRoleID);
        this.loadRolesForGroup(g).then( () => {
          return this.loadMembersForGroup(g);
        }).then( () => {
          this.groups[g.GroupID.toString()] = g;
        }).catch( (err) => {
          console.log(err);
        })
      }
    })
  }

  private loadRolesForGroup(g: GroupObj): Promise<Group> {
    return new Promise<GroupRole[]>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM osrole WHERE GroupID=?', g.GroupID.toString(), (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      let roles: GroupRole[] = [];
      for (let r of rows) {
        let g = new GroupRole;
        g.GroupID = new UUIDString(r.GroupID);
        g.RoleID = new UUIDString(r.RoleID);
        g.Name = r.Name;
        g.Description = r.Description;
        g.Title = r.Title;
        g.Powers = r.Powers;
        roles.push(g);
      }
      g.Roles = roles;
      return g;
    });
  }

  private loadMembersForGroup(g: GroupObj): Promise<Group> {
    return new Promise<GroupMembership[]>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM osgroupmembership WHERE GroupID=?', g.GroupID.toString(), (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      let members: GroupMembership[] = [];
      for (let r of rows) {
        let m = new GroupMembership();
        m.GroupID = new UUIDString(r.GroupID);
        m.AgentID = new UUIDString(r.AgentID);
        m.SelectedRoleID = new UUIDString(r.SelectedRoleID);
        m.Contribution = r.Contribution;
        m.ListInProfile = r.ListInProfile;
        m.AcceptNotices = r.AcceptNotices;
        members.push(m);
      }
      g.Members = members;
      return g;
    })
  }
}
