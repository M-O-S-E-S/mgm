
import { IPool } from 'promise-mysql';

import { IUser } from '../Types';

import { Credential } from '../Auth';

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
  created: Date
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
  private passwordHash: string

  constructor(u: user_row) {
    this.UUID = u.UUID;
    this.username = u.username;
    this.lastname = u.lastname;
    this.godLevel = u.godLevel;
    this.email = u.email;
    this.passwordHash = u.passwordHash;
    this.created = u.created;
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
}

export class Users {
  private db: IPool

  constructor(db: IPool) {
    this.db = db;
  }

  getAll(): Promise<IUser[]> {
    return this.db.query('SELECT * FROM users WHERE 1').then((rows: user_row[]) => {
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

  /*
  
    createUserFromTemplate(fname: string, lname: string, cred: Credential, email: string, template: UserInstance): Promise<UserInstance> {
      if (!template) {
        return Promise.reject('MGM only supports creating users from a template');
      }
  
      let newUser: UserInstance;
  
      console.log('Creating new user account ' + fname + ' ' + lname);
  
      return this.user.create({
        UUID: UUIDString.random().toString(),
        username: fname,
        lastname: lname,
        passwordHash: cred.hash,
        passwordSalt: '',
        homeRegion: template.homeRegion,
        homeRegionID: template.homeRegionID,
        homeLocationX: template.homeLocationX,
        homeLocationY: template.homeLocationY,
        homeLocationZ: template.homeLocationZ,
        homeLookAtX: template.homeLookAtX,
        homeLookAtY: template.homeLookAtY,
        homeLookAtZ: template.homeLookAtZ,
        created: 0,
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
      }).then((u: UserInstance) => {
        newUser = u;
        console.log('Cloning inventory for ' + fname + ' ' + lname);
        // clone inventory and appearance
        let t = new Inventory(template.UUID, this.items, this.folders, this.appearance);
        return t.cloneInventoryOnto(newUser.UUID);
      }).then(() => {
        return newUser;
      })
    }

    */
}