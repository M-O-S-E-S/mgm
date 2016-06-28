
import * as crypto from 'crypto';
import {UUIDString} from './UUID';
import { Inventory, Folder, Item } from './Inventory';
import { SqlConnector } from './sqlConnector';

export class User {
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

  constructor(id: UUIDString, fname: string, lname: string, email: string, hash: Credential, godLevel: number, iz_level: number) {
    this.UUID = id;
    this.username = fname;
    this.lastname = lname;
    this.passwordHash = hash;
    this.godLevel = godLevel;
    this.iz_level = iz_level;
    this.email = email;

    this.profileImage = UUIDString.zero();
    this.profileFirstImage = UUIDString.zero();
    this.webLoginKey = UUIDString.zero();
    this.homeRegionID = UUIDString.zero();
    this.partner = UUIDString.zero();
    this.profileCanDoMask = 0;
    this.profileWantDoMask = 0;
  }

  templateOnto(firstname: string, lastname: string, password: string, email: string, hal: SqlConnector): Promise<void> {
    let appearance: Appearance;
    let inventory: Inventory;
    let newUser: User;
    let newAppearance: Appearance;
    let newInventory: Inventory;
    return hal.getAppearance(this.UUID)
    .then((a: Appearance) => {
      appearance = a;
      return hal.getInventory(this.UUID);
    }).then((i: Inventory) => {
      inventory = i;

      /* create new inventory, etc from template account */
      newUser = new User(UUIDString.random(), firstname, lastname, email, Credential.fromPlaintext(password), 0, 1);
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

      return hal.addUser(newUser);
    }).then(() => {
      return hal.addAppearance(newAppearance);
    }).then(() => {
      return hal.addInventory(newInventory);
    });
  }


  static fromDB(row): User {
    let u: User = new User(new UUIDString(row.UUID), row.username, row.lastname, row.email, Credential.fromHalcyon(row.passwordHash), row.godLevel, row.iz_level);
    u.homeRegion = row.homeRegion;
    u.homeLocationX = row.homeLocationX;
    u.homeLocationY = row.homeLocationY;
    u.homeLocationZ = row.homeLocationZ;
    u.homeLookAtX = row.homeLookAtX;
    u.homeLookAtY = row.homeLookAtY;
    u.homeLookAtZ = row.homeLookAtZ;
    u.created = row.created;
    u.lastLogin = row.lastLogin;
    u.userInventoryURI = row.userInventoryURI;
    u.userAssetURI = row.userAssetURI;
    u.profileCanDoMask = row.profileCanDoMask;
    u.profileWantDoMask = row.profileWantDoMask;
    u.profileAboutText = row.profileAboutText;
    u.profileFirstText = row.profileFirstText;
    u.profileImage = row.profileImage;
    u.profileFirstImage = row.profileFirstImage;
    u.webLoginKey = row.webLoginKey;
    u.homeRegionID = row.homeRegionID;
    u.userFlags = row.userFlags;
    u.customType = row.customType;
    u.partner = row.partner;
    u.email = row.email;
    u.profileURL = row.profileURL;
    u.skillsMask = row.skillsMask;
    u.skillsText = row.skillsText;
    u.wantToMask = row.wantToMask;
    u.wantToText = row.wantToText;
    u.languagesText = row.languagesText;

    return u;
  }
}

export class Appearance {
  Owner: UUIDString
  Serial: number
  Visual_Params: Buffer
  Texture: Buffer
  Avatar_Height: number
  Body_Item: UUIDString
  Body_Asset: UUIDString
  Skin_Item: UUIDString
  Skin_Asset: UUIDString
  Hair_Item: UUIDString
  Hair_Asset: UUIDString
  Eyes_Item: UUIDString
  Eyes_Asset: UUIDString
  Shirt_Item: UUIDString
  Shirt_Asset: UUIDString
  Pants_Item: UUIDString
  Pants_Asset: UUIDString
  Shoes_Item: UUIDString
  Shoes_Asset: UUIDString
  Socks_Item: UUIDString
  Socks_Asset: UUIDString
  Jacket_Item: UUIDString
  Jacket_Asset: UUIDString
  Gloves_Item: UUIDString
  Gloves_Asset: UUIDString
  Undershirt_Item: UUIDString
  Undershirt_Asset: UUIDString
  Underpants_Item: UUIDString
  Underpants_Asset: UUIDString
  Skirt_Item: UUIDString
  Skirt_Asset: UUIDString
  alpha_item: UUIDString
  alpha_asset: UUIDString
  tattoo_item: UUIDString
  tattoo_asset: UUIDString
  physics_item: UUIDString
  physics_asset: UUIDString
}

export class Credential {
  hash: string

  compare(plain: string, salt?: string){
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
