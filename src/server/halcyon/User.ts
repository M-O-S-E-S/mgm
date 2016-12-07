
import * as crypto from 'crypto';
import {UUIDString} from './UUID';
import { Inventory, Folder, Item } from './Inventory';
import { Sql } from '../mysql/sql';
import { Appearance } from './Appearance';

export interface User {
  getUUID(): UUIDString
  getUsername(): string
  getLastName(): string
  getEmail(): string
  setEmail(email: string): Promise<User>
  getGodLevel(): number
  setGodLevel(level: number): Promise<User>
  getCredential(): Credential
  setCredential(cred: Credential): Promise<User>
  templateOnto(firstname: string, lastname: string, password: Credential, email: string): Promise<UserObj>
}

class UserObj implements User{
  db: Sql
  UUID: UUIDString
  username: string
  lastname: string
  passwordHash: Credential
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
  profileImage: UUIDString
  profileFirstImage: UUIDString
  webLoginKey: UUIDString
  homeRegionID: UUIDString
  userFlags: number
  godLevel: number
  iz_level: number
  customType: string
  partner: UUIDString
  email: string
  profileURL: string
  skillsMask: number
  skillsText: string
  wantToMask: number
  wantToText: string
  languagesText: string

  constructor(db: Sql) {
    this.db = db;
    this.profileImage = UUIDString.zero();
    this.profileFirstImage = UUIDString.zero();
    this.webLoginKey = UUIDString.zero();
    this.homeRegionID = UUIDString.zero();
    this.partner = UUIDString.zero();
    this.profileCanDoMask = 0;
    this.profileWantDoMask = 0;
  }

  getUUID(): UUIDString {
    return this.UUID;
  }

  getUsername(): string {
    return this.username;
  }

  getLastName(): string {
    return this.lastname;
  }

  getEmail(): string {
    return this.email;
  }

  getGodLevel(): number {
    return this.godLevel;
  }

  getCredential(): Credential {
    return this.passwordHash;
  }

  setCredential(cred: Credential): Promise<User> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('UPDATE users SET passwordHash=? WHERE UUID=?', [cred.hash, this.UUID.toString()], (err) => {
        if (err) return reject(err);
        resolve();
      });
    }).then(() => {
      this.passwordHash = cred;
      return this;
    })
  }

  setGodLevel(level: number): Promise<User> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('UPDATE users SET godLevel=? WHERE UUID=?', [level, this.UUID.toString()], err => {
        if (err) return reject(err);
        resolve();
      });
    }).then(() => {
      this.godLevel = level;
      return this;
    })
  }

  setEmail(email: string): Promise<User> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('UPDATE users SET email=? WHERE UUID=?', [email, this.UUID.toString()], err => {
        if (err) return reject(err);
        resolve();
      });
    }).then(() => {
      this.email = email;
      return this;
    })
  }

  templateOnto(firstname: string, lastname: string, password: Credential, email: string): Promise<UserObj> {
    let appearance: Appearance;
    let inventory: Inventory;
    let newUser: UserObj;
    let newAppearance: Appearance;
    let newInventory: Inventory;
    return Appearance.FromDB(this.db, this.UUID)
      .then((a: Appearance) => {
        appearance = a;
        return Inventory.FromDB(this.db, this.UUID);
      }).then((i: Inventory) => {
        inventory = i;

        /* create new inventory, etc from template account */
        newUser = new UserObj(this.db);
        newUser.UUID = UUIDString.random();
        newUser.username = firstname;
        newUser.lastname = lastname;
        newUser.email = email;
        newUser.passwordHash = password;
        newUser.godLevel = 1;
        newUser.homeRegion = this.homeRegion;
        newUser.homeLocationX = this.homeLocationX;
        newUser.homeLocationY = this.homeLocationY;
        newUser.homeLocationZ = this.homeLocationZ;
        newUser.homeLookAtX = this.homeLookAtX;
        newUser.homeLookAtY = this.homeLookAtY;
        newUser.homeLookAtZ = this.homeLookAtZ;
        newUser.godLevel = 1;
        newUser.iz_level = 0;
        newUser.created = Date.now();
        newUser.webLoginKey = UUIDString.zero();
        newUser.profileFirstImage = UUIDString.zero();

        let uuidMap: { [key: string]: UUIDString } = {};
        let folders: Folder[] = [];
        let items: Item[] = [];
        //generate new ids for folders
        for (let folder of inventory.getFolders()) {
          uuidMap[folder.folderID.toString()] = UUIDString.random();
        }
        //map zero back to zero
        uuidMap[UUIDString.zero().toString()] = UUIDString.zero();
        //generate new ids for inventory items
        for (let item of inventory.getItems()) {
          uuidMap[item.inventoryID.toString()] = UUIDString.random();
        }

        //generate new folder list, translating ids
        for (let folder of inventory.getFolders()) {
          let f = new Folder(
            folder.folderName,
            folder.Type,
            folder.version,
            uuidMap[folder.folderID.toString()],
            newUser.UUID,
            uuidMap[folder.parentFolderID.toString()]
          );
          folders.push(f);
        }

        //generate new item list, translating ids
        for (let item of inventory.getItems()) {
          let i = new Item();
          i.assetID = item.assetID;
          i.assetType = item.assetType;
          if (i.assetType === 24) {
            //links do not have assets, assetID points to an inventory item
            i.assetID = uuidMap[item.assetID.toString()];
          }
          i.inventoryName = item.inventoryName;
          i.inventoryDescription = item.inventoryDescription;
          i.inventoryNextPermissions = item.inventoryNextPermissions;
          i.inventoryCurrentPermissions = item.inventoryCurrentPermissions;
          i.invType = item.invType;
          i.creatorID = item.creatorID;
          i.inventoryBasePermissions = item.inventoryBasePermissions;
          i.inventoryEveryOnePermissions = item.inventoryEveryOnePermissions;
          i.salePrice = item.salePrice;
          i.saleType = item.saleType;
          i.creationDate = item.creationDate;
          i.groupID = item.groupID;
          i.groupOwned = item.groupOwned;
          i.flags = item.flags;
          i.inventoryID = uuidMap[item.inventoryID.toString()];
          i.avatarID = newUser.UUID;
          i.parentFolderID = uuidMap[item.parentFolderID.toString()];
          i.inventoryGroupPermissions = item.inventoryGroupPermissions;
          items.push(i);
        }

        newInventory = new Inventory(folders, items);

        // generate new appearance.  Inventory items are changed to match new items
        // but asset IDs are unchanged to reference the same assets
        newAppearance = new Appearance();
        newAppearance.Owner = newUser.UUID;
        newAppearance.Serial = appearance.Serial;
        newAppearance.Visual_Params = appearance.Visual_Params;
        newAppearance.Texture = appearance.Texture;
        newAppearance.Avatar_Height = appearance.Avatar_Height;
        newAppearance.Body_Item = uuidMap[appearance.Body_Item.toString()];
        newAppearance.Body_Asset = appearance.Body_Asset;
        newAppearance.Skin_Item = uuidMap[appearance.Skin_Item.toString()];
        newAppearance.Skin_Asset = appearance.Skin_Asset;
        newAppearance.Hair_Item = uuidMap[appearance.Hair_Item.toString()];
        newAppearance.Hair_Asset = appearance.Hair_Asset;
        newAppearance.Eyes_Item = uuidMap[appearance.Eyes_Item.toString()];
        newAppearance.Eyes_Asset = appearance.Eyes_Asset;
        newAppearance.Shirt_Item = uuidMap[appearance.Shirt_Item.toString()];
        newAppearance.Shirt_Asset = appearance.Shirt_Asset;
        newAppearance.Pants_Item = uuidMap[appearance.Pants_Item.toString()];
        newAppearance.Pants_Asset = appearance.Pants_Asset;
        newAppearance.Shoes_Item = uuidMap[appearance.Shoes_Item.toString()];
        newAppearance.Shoes_Asset = appearance.Shoes_Asset;
        newAppearance.Socks_Item = uuidMap[appearance.Socks_Item.toString()];
        newAppearance.Socks_Asset = appearance.Socks_Asset;
        newAppearance.Jacket_Item = uuidMap[appearance.Jacket_Item.toString()];
        newAppearance.Jacket_Asset = appearance.Jacket_Asset;
        newAppearance.Gloves_Item = uuidMap[appearance.Gloves_Item.toString()];
        newAppearance.Gloves_Asset = appearance.Gloves_Asset;
        newAppearance.Undershirt_Item = uuidMap[appearance.Undershirt_Item.toString()];
        newAppearance.Undershirt_Asset = appearance.Undershirt_Asset;
        newAppearance.Underpants_Item = uuidMap[appearance.Underpants_Item.toString()];
        newAppearance.Underpants_Asset = appearance.Underpants_Asset;
        newAppearance.Skirt_Item = uuidMap[appearance.Skirt_Item.toString()];
        newAppearance.Skirt_Asset = appearance.Skirt_Asset;
        newAppearance.alpha_item = uuidMap[appearance.alpha_item.toString()];
        newAppearance.alpha_asset = appearance.alpha_asset;
        newAppearance.tattoo_item = uuidMap[appearance.tattoo_item.toString()];
        newAppearance.tattoo_asset = appearance.tattoo_asset;
        newAppearance.physics_item = uuidMap[appearance.physics_item.toString()];
        newAppearance.physics_asset = appearance.physics_asset;

        return new Promise<void>((resolve, reject) => {
          let args = {
            UUID: newUser.UUID.toString(),
            username: newUser.username,
            lastname: newUser.lastname,
            passwordHash: newUser.passwordHash.hash,
            passwordSalt: '',
            created: Math.round(new Date().getTime() / 1000.0),
            lastLogin: 0,
            godLevel: newUser.godLevel,
            iz_level: newUser.iz_level,
            email: newUser.email,
            /* these fields are required, but we dont have sane ways to configure them */
            homeRegion: newUser.homeRegion,
            homeLocationX: newUser.homeLocationX,
            homeLocationY: newUser.homeLocationY,
            homeLocationZ: newUser.homeLocationZ,
            homeLookAtX: newUser.homeLookAtX,
            homeLookAtY: newUser.homeLookAtY,
            homeLookAtZ: newUser.homeLookAtZ,
            userInventoryURI: newUser.userInventoryURI || '',
            userAssetURI: newUser.userAssetURI || '',
            profileImage: newUser.profileImage.toString() || UUIDString.zero().toString(),
            profileFirstImage: newUser.profileFirstImage.toString() || UUIDString.zero().toString(),
            webLoginKey: newUser.webLoginKey.toString() || UUIDString.zero().toString(),
            profileAboutText: newUser.profileAboutText || '',
            profileFirstText: newUser.profileFirstText || '',
            profileURL: newUser.profileURL || '',
            profileCanDoMask: newUser.profileCanDoMask,
            profileWantDoMask: newUser.profileWantDoMask
          }
          this.db.pool.query('INSERT INTO users SET ?', args, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }).then(() => {
        return newAppearance.save(this.db);
      }).then(() => {
        return newInventory.save(this.db);
      }).then(() => {
        return newUser;
      });
  }
}

export class Credential {
  hash: string

  compare(plain: string, salt?: string) {
    return this.hash === Credential.fromPlaintext(plain, salt).hash;
  }

  static fromPlaintext(plain: string, salt?: string): Credential {
    return Credential.fromOpensim(crypto.createHash('md5').update(plain).digest('hex'));
  }

  static fromOpensim(singleHash: string, salt?: string) {
    if (singleHash.slice(0, 3) !== '$1$') {
      singleHash = '$1$' + singleHash;
    }
    let c: Credential = new Credential();
    c.hash = crypto.createHash('md5').update(singleHash.slice(3) + ':' + (salt ? salt : '')).digest('hex');
    return c
  }

  static fromHalcyon(hash: string) {
    let c: Credential = new Credential();
    c.hash = hash
    return c
  }
}

export class UserMgr {
  private static _instance: UserMgr = null;
  private db: Sql
  private users: { [key: string]: UserObj } = {};

  constructor(db: Sql) {
    if (UserMgr._instance) {
      throw new Error('RegionMgr singleton has already been initialized');
    }
    this.db = db;
    this.initialize();

    UserMgr._instance = this;
  }

  public static instance(): UserMgr {
    return UserMgr._instance;
  }

  createFromTemplate(t: User, fname: string, lname: string, password: Credential, email: string): Promise<void> {
    return t.templateOnto(fname, lname, password, email).then( (u: UserObj) => {
      this.users[u.UUID.toString()] = u;
    });
  }

  getUsers(): Promise<User[]> {
    let users: User[] = [];
    for (let id in this.users) {
      users.push(this.users[id]);
    }
    return Promise.resolve(users);
  }

  getUser(id: UUIDString): Promise<User> {
    if (id.toString() in this.users) {
      return Promise.resolve(this.users[id.toString()]);
    }
    return Promise.reject(new Error("User " + id.toString() + " does not exist"));
  }

  getUserByEmail(email:string): Promise<User> {
    for (let id in this.users) {
      if (this.users[id].email === email) {
        return Promise.resolve(this.users[id]);
      }
    }
    return Promise.reject(new Error("User " + email + " does not exist"));
  }

  getUserByName(name: string): Promise<User> {
    let nameParts = name.split(' ');
    for (let id in this.users) {
      if (this.users[id].username === nameParts[0] && this.users[id].lastname === nameParts[1]) {
        return Promise.resolve(this.users[id]);
      }
    }
    return Promise.reject(new Error("User " + name + " does not exist"));
  }

  deleteUser(u: User): Promise<void> {
    let idString = u.getUUID().toString();
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query("DELETE FROM users WHERE UUID=?", idString, (err) => {
        if (err) return reject(err);

        this.db.pool.query("DELETE FROM avatarappearance WHERE Owner=?", idString, (err) => {
          if (err) return reject(err);

          this.db.pool.query("DELETE FROM inventoryfolders WHERE agentID=?", idString, (err) => {
            if (err) return reject(err);

            this.db.pool.query("DELETE FROM inventoryitems WHERE avatarID=?", idString, (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        });
      })
    }).then(() => {
      delete this.users[idString];
    });
  }

  private initialize(): Promise<void> {
    return new Promise<User[]>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM users WHERE 1', (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows)
      });
    }).then((rows: any[]) => {
      for (let r of rows) {
        let u = new UserObj(this.db);
        u.UUID = new UUIDString(r.UUID);
        u.username = r.username;
        u.lastname = r.lastname;
        u.passwordHash = Credential.fromHalcyon(r.passwordHash);
        u.passwordSalt = r.passwordSalt;
        u.homeRegion = r.homeRegion;
        u.homeLocationX = r.homeLocationX;
        u.homeLocationY = r.homeLocationY;
        u.homeLocationZ = r.homeLocationZ;
        u.homeLookAtX = r.homeLookAtX;
        u.homeLookAtY = r.homeLookAtY;
        u.homeLookAtZ = r.homeLookAtZ;
        u.created = r.created;
        u.lastLogin = r.lastLogin;
        u.userInventoryURI = r.userInventoryURI;
        u.userAssetURI = r.userAssetURI;
        u.profileCanDoMask = r.profileCanDoMask;
        u.profileWantDoMask = r.profileWantDoMask;
        u.profileAboutText = r.profileAboutText;
        u.profileFirstText = r.profileFirstText;
        u.profileImage = new UUIDString(r.profileImage || UUIDString.zero().toString());
        u.profileFirstImage = new UUIDString(r.profileFirstImage || UUIDString.zero().toString());
        u.webLoginKey = new UUIDString(r.webLoginKey || UUIDString.zero().toString());
        u.homeRegionID = new UUIDString(r.homeRegionID || UUIDString.zero().toString());
        u.userFlags = r.userFlags;
        u.godLevel = r.godLevel;
        u.iz_level = r.iz_level;
        u.customType = r.customType;
        u.partner = new UUIDString(r.parter || UUIDString.zero().toString());
        u.email = r.email;
        u.profileURL = r.profileURL;
        u.skillsMask = r.skillsMask;
        u.skillsText = r.skillsText;
        u.wantToMask = r.wantToMask;
        u.wantToText = r.wantToText;
        u.languagesText = r.languagesText;
        this.users[u.getUUID().toString()] = u;
      }
    }).catch((err: Error) => {
      console.log(err.stack);
    })
  }
}
