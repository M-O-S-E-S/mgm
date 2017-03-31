
import { IPool } from 'promise-mysql';
import { IUser } from '../types';
import { Credential } from '../Auth';
import { UUID } from '../UUID';
import { CloneFrom, ApplySkeleton } from './Inventory';
import Promise = require('bluebird');

interface user_row {
  UUID: string
  username: string
  lastname: string
  passwordHash: string
  passwordSalt: string
  homeRegion: number
  homeLocationX: number
  homeLocationY: number
  homeLocationZ: number
  homeLookAtX: number
  homeLookAtY: number
  homeLookAtZ: number
  created: number
  lastLogin: number
  userInventoryURI: string
  userAssetURI: string
  profileCanDoMask: number
  profileWantDoMask: number
  profileAboutText: string
  profileFirstText: string
  profileImage: string
  profileFirstImage: string
  webLoginKey: string
  homeRegionID: string
  userFlags: number
  godLevel: number
  iz_level: number
  customType: string
  partner: string
  email: string
  profileURL: string
  skillsMask: number
  skillsText: string
  wantToMask: number
  wantToText: string
  languagesText: string
}

class UserObj implements IUser {
  UUID: string
  username: string
  lastname: string
  godLevel: number
  email: string
  created: Date
  partner: string
  online: boolean
  private passwordHash: string

  constructor(u: user_row) {
    this.UUID = u.UUID;
    this.username = u.username;
    this.lastname = u.lastname;
    this.godLevel = u.godLevel;
    this.email = u.email;
    this.passwordHash = u.passwordHash;
    this.created = new Date(u.created);
    this.partner = u.partner;
  }

  name(): string {
    return this.username + ' ' + this.lastname;
  }
  isSuspended(): boolean {
    return this.godLevel < 1;
  }
  isAdmin(): boolean {
    return this.godLevel >= 250;
  }
  authenticate(password: string): boolean {
    return Credential.fromHalcyon(this.passwordHash).compare(password)
  }
  toJSON(): IUser {
    return {
      UUID: this.UUID,
      username: this.username,
      lastname: this.lastname,
      email: this.email,
      created: this.created,
      partner: this.partner,
      name: this.name,
      isSuspended: this.isSuspended,
      isAdmin: this.isAdmin,
      authenticate: this.authenticate
    }
  }
}

export class Users {
  private db: IPool

  constructor(db: IPool) {
    this.db = db;
  }

  getAll(): Promise<IUser[]> {
    return this.db.query('SELECT * FROM `users`').then((rows: user_row[]) => {
      return rows.map((row: user_row): IUser => {
        return new UserObj(row);
      });
    });
  }

  getByID(uuid: string): Promise<IUser> {
    return this.db.query('SELECT * FROM users WHERE UUID=?', [uuid]).then((rows: user_row[]) => {
      if (rows.length == 0)
        throw new Error('User with id ' + uuid + ' does not exist');
      return new UserObj(rows[0]);
    });
  }

  getByName(name: string): Promise<IUser> {
    let nameParts = name.split(' ');
    return this.db.query('SELECT * FROM users WHERE username=? AND lastname=?', [nameParts[0], nameParts[1]]).then((rows: user_row[]) => {
      if (rows.length == 0)
        throw new Error('User with name ' + name + ' does not exist');
      return new UserObj(rows[0]);
    });
  }

  setPassword(user: IUser, cred: Credential): Promise<void> {
    return this.db.query('UPDATE users SET passwordHash=? WHERE UUID=?', [cred.hash, user.UUID]);
  }

  getByEmail(email: string): Promise<IUser> {
    return this.db.query('SELECT * FROM users WHERE email=?', email).then((rows: user_row[]) => {
      if (rows.length == 0)
        throw new Error('User with email ' + email + ' does not exist');
      return new UserObj(rows[0]);
    });
  }

  setAccessLevel(u: IUser, accessLevel: number): Promise<IUser> {
    return this.db.query('UPDATE users SET godLevel=? WHERE UUID=?', [accessLevel, u.UUID]).then(() => {
      (<UserObj>u).godLevel = accessLevel;
      return u;
    });
  }

  setEmail(u: IUser, email: string): Promise<IUser> {
    return this.db.query('UPDATE users SET email=? WHERE UUID=?', [email, u.UUID]).then(() => {
      u.email = email;
      return u;
    });
  }

  delete(u: IUser): Promise<void> {
    return Promise.all([
      this.db.query('DELETE FROM agents WHERE UUID=?', u.UUID),
      this.db.query('DELETE FROM avatarappearance WHERE Owner=?', u.UUID),
      this.db.query('DELETE FROM avatarattachments WHERE UUID=?', u.UUID),
      this.db.query('DELETE FROM botattachments WHERE UUID=?', u.UUID),
      this.db.query('DELETE FROM botappearance WHERE Owner=?', u.UUID),
      this.db.query('DELETE FROM classifieds WHERE creatoruuid=?', u.UUID),
      this.db.query('DELETE FROM economy_totals WHERE user_id=?', u.UUID),
      this.db.query('DELETE FROM estateban WHERE bannedUUID=?', u.UUID),
      this.db.query('DELETE FROM estate_managers WHERE uuid=?', u.UUID),
      this.db.query('DELETE FROM estate_users WHERE uuid=?', u.UUID),
      this.db.query('DELETE FROM events WHERE owneruuid=?', u.UUID),
      this.db.query('DELETE FROM inventoryfolders WHERE agentID=?', u.UUID),
      this.db.query('DELETE FROM inventoryitems WHERE avatarID=?', u.UUID),
      this.db.query('DELETE FROM InventoryMigrationStatus WHERE user_id=?', u.UUID),
      this.db.query('DELETE FROM landaccesslist WHERE LandUUID in (SELECT UUID FROM land WHERE OwnerUUID=?)', u.UUID).then(() => {
        return this.db.query('DELETE FROM land WHERE OwnerUUID=?', u.UUID);
      }),
      this.db.query('DELETE FROM LoginHistory WHERE user_id=?', u.UUID),
      this.db.query('DELETE FROM mutelist WHERE AgentID=?', u.UUID),
      this.db.query('DELETE FROM osagent WHERE AgentID=?', u.UUID),
      this.db.query('DELETE FROM osgroupmembership WHERE AgentID=?', u.UUID),
      this.db.query('DELETE FROM osgrouprolemembership WHERE AgentID=?', u.UUID),
      this.db.query('DELETE FROM userfriends WHERE ownerID=? OR friendID=?', [u.UUID, u.UUID]),
      this.db.query('DELETE FROM userfriends_old WHERE ownerID=? OR friendID=?', [u.UUID, u.UUID]),
      this.db.query('DELETE FROM usernotes WHERE useruuid=?', u.UUID),
      this.db.query('DELETE FROM userpicks WHERE creatoruuid=?', u.UUID),
      this.db.query('DELETE FROM userpreferences WHERE user_id=?', u.UUID),
      this.db.query('DELETE FROM userprefs_bak WHERE user_id=?', u.UUID),
      this.db.query('DELETE FROM users WHERE UUID=?', u.UUID),
      this.db.query('DELETE FROM users_bak WHERE UUID=?', u.UUID)
    ]).then(() => { });
  }

  createUserFromSkeleton(fname: string, lname: string, cred: Credential, email: string): Promise<IUser> {
    let newUser: user_row;
    let t: user_row;
    newUser = {
      UUID: UUID.random().toString(),
      username: fname,
      lastname: lname,
      passwordHash: cred.hash,
      passwordSalt: '',
      homeRegion: 0,
      homeRegionID: '00000000-0000-0000-0000-000000000000',
      homeLocationX: 128,
      homeLocationY: 128,
      homeLocationZ: 128,
      homeLookAtX: 0,
      homeLookAtY: 0,
      homeLookAtZ: 0,
      created: new Date().getTime() / 1000,
      lastLogin: 0,
      userInventoryURI: '',
      userAssetURI: '',
      profileCanDoMask: 0,
      profileWantDoMask: 0,
      profileAboutText: '',
      profileFirstText: '00000000-0000-0000-0000-000000000000',
      profileImage: '00000000-0000-0000-0000-000000000000',
      profileFirstImage: '00000000-0000-0000-0000-000000000000',
      webLoginKey: '00000000-0000-0000-0000-000000000000',
      userFlags: 0,
      godLevel: 1,
      iz_level: 0,
      customType: '',
      partner: '00000000-0000-0000-0000-000000000000',
      email: email,
      profileURL: '',
      skillsMask: 0,
      skillsText: '',
      wantToMask: 0,
      wantToText: '',
      languagesText: ''
    }
    return this.db.query('INSERT INTO users SET ?', newUser).then(() => {
      return ApplySkeleton(this.db, new UserObj(newUser));
    });
  }

  createUserFromTemplate(fname: string, lname: string, cred: Credential, email: string, template: IUser): Promise<IUser> {
    if (!template) {
      return Promise.reject('MGM only supports creating users from a template');
    }

    let newUser: user_row;
    let t: user_row;
    return this.db.query('SELECT * FROM users WHERE UUID=?', template.UUID).then((rows: user_row[]) => {
      t = rows[0];
    }).then(() => {

      newUser = {
        UUID: UUID.random().toString(),
        username: fname,
        lastname: lname,
        passwordHash: cred.hash,
        passwordSalt: '',
        homeRegion: t.homeRegion,
        homeRegionID: t.homeRegionID,
        homeLocationX: t.homeLocationX,
        homeLocationY: t.homeLocationY,
        homeLocationZ: t.homeLocationZ,
        homeLookAtX: t.homeLookAtX,
        homeLookAtY: t.homeLookAtY,
        homeLookAtZ: t.homeLookAtZ,
        created: new Date().getTime() / 1000,
        lastLogin: 0,
        userInventoryURI: '',
        userAssetURI: '',
        profileCanDoMask: 0,
        profileWantDoMask: 0,
        profileAboutText: '',
        profileFirstText: '00000000-0000-0000-0000-000000000000',
        profileImage: '',
        profileFirstImage: '00000000-0000-0000-0000-000000000000',
        webLoginKey: '00000000-0000-0000-0000-000000000000',
        userFlags: 0,
        godLevel: 1,
        iz_level: 0,
        customType: '',
        partner: '00000000-0000-0000-0000-000000000000',
        email: email,
        profileURL: '',
        skillsMask: 0,
        skillsText: '',
        wantToMask: 0,
        wantToText: '',
        languagesText: ''
      }
      return this.db.query('INSERT INTO users SET ?', newUser);
    }).then(() => {
      return CloneFrom(this.db, new UserObj(newUser), template);
    });
  }

  retemplateUser(user: IUser, template: IUser): Promise<IUser> {
    if (!user || !template) {
      return Promise.reject('User and/or template missing');
    }

    return CloneFrom(this.db, user, template);
  }
}
