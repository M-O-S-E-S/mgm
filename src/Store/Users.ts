
import { IPool } from 'mysql';

export interface User {
  UUID: string
  username: string
  lastname: string
  email: string

  name(): string
  isSuspended(): boolean
  isAdmin(): boolean
}

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

class UserObj implements User {
  UUID: string
  username: string
  lastname: string
  godLevel: number
  email: string

  constructor(u: user_row) {
    this.UUID = u.UUID;
    this.username = u.username;
    this.lastname = u.lastname;
    this.godLevel = u.godLevel;
    this.email = u.email;
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
}

export class Users {
  private db: IPool

  constructor(db: IPool) {
    this.db = db;
  }

  getAll(): Promise<User[]> {
    return new Promise<User[]>((resolve, reject) => {
      this.db.query('SELECT * FROM users WHERE 1', (err: Error, rows: user_row[]) => {
        if (err)
          return reject(err);
        resolve(rows.map((row: user_row): User => {
          return new UserObj(row);
        }));
      })
    })
  }

  getByID(uuid: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.db.query('SELECT * FROM users WHERE UUID=?', [uuid], (err: Error, rows: user_row[]) => {
        if (err)
          return reject(err);
        if (rows.length == 0)
          return reject(new Error('User ' + uuid + ' does not exist'));
        resolve(new UserObj(rows[0]));
      })
    })
  }

  /*
    getByName(name: string): Promise<UserInstance> {
      let nameParts = name.split(' ');
      return this.user.findOne({
        where: {
          username: nameParts[0],
          lastname: nameParts[1]
        }
      }).then((user: UserInstance) => {
        if (user) return user;
        throw new Error('User does not exist');
      })
    }
  
    getByEmail(email: string): Promise<UserInstance> {
      return this.user.findOne({
        where: {
          email: email
        }
      }).then((u: UserInstance) => {
        if (u)
          return u;
        throw new Error('User does not exist');
      })
    }
  
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
  
  
    setPassword(user: string, plaintext: string): Promise<void> {
      return this.user.find({
        where: {
          uuid: user
        }
      }).then((u: UserInstance) => {
        if (u) {
          return u.updateAttributes({
            passwordHash: Credential.fromPlaintext(plaintext)
          })
        }
      }).then(() => { });
    }
    */
}