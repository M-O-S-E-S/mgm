
import * as Sequelize from 'sequelize';
import {
  UserInstance, UserAttribute,
  AvatarAppearanceInstance, AvatarAppearanceAttribute,
  InventoryItemInstance, InventoryItemAttribute,
  InventoryFolderInstance, InventoryFolderAttribute
} from './mysql';
import { Credential } from '../auth/Credential';
import { UUIDString } from '../util/UUID';

import { Inventory } from './Inventory';

export class Users {
  private user: Sequelize.Model<UserInstance, UserAttribute>
  private appearance: Sequelize.Model<AvatarAppearanceInstance, AvatarAppearanceAttribute>
  private items: Sequelize.Model<InventoryItemInstance, InventoryItemAttribute>
  private folders: Sequelize.Model<InventoryFolderInstance, InventoryFolderAttribute>

  constructor(
    user: Sequelize.Model<UserInstance, UserAttribute>,
    appearance: Sequelize.Model<AvatarAppearanceInstance, AvatarAppearanceAttribute>,
    items: Sequelize.Model<InventoryItemInstance, InventoryItemAttribute>,
    folders: Sequelize.Model<InventoryFolderInstance, InventoryFolderAttribute>
  ) {
    this.user = user;
    this.appearance = appearance;
    this.items = items;
    this.folders = folders;
  }

  getAll(): Promise<UserInstance[]> {
    return this.user.findAll();
  }

  getByName(name: string): Promise<UserInstance> {
    let nameParts = name.split(' ');
    return this.user.findOne({
      where: {
        username: nameParts[0],
        lastname: nameParts[1]
      }
    }).then( (user: UserInstance) => {
      if(user) return user;
      throw new Error('User does not exist');
    })
  }

  getByEmail(email: string): Promise<UserInstance> {
    return this.user.findOne({
      where: {
        email: email
      }
    })
  }

  getByID(id: string): Promise<UserInstance> {
    return this.user.findOne({
      where: {
        UUID: id
      }
    })
  }

  createUserFromTemplate(fname: string, lname: string, cred: Credential, email: string, template: UserInstance): Promise<UserInstance> {
    if(!template){
      return Promise.reject('MGM only supports creating users from a template');
    }

    let newUser: UserInstance;

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
      profileFirstText: '',
      profileImage: '',
      profileFirstImage: '',
      webLoginKey: '',
      userFlags: 0,
      godLevel: 1,
      iz_level: 0,
      customType: '',
      partner: '',
      email: email,
      profileURL: '',
      skillsMask: 0,
      skillsText: '',
      wantToMask: 0,
      wantToText: '',
      languagesText: ''
    }).then( (u: UserInstance) => {
      newUser = u;
      // clone inventory and appearance
      let t = new Inventory(template.UUID, this.items, this.folders, this.appearance);
      return t.cloneInventoryOnto(newUser.UUID);
    }).then( () => {
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
}