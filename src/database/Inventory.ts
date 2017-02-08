
import * as Sequelize from 'sequelize';
import {
  InventoryItemInstance, InventoryItemAttribute,
  InventoryFolderInstance, InventoryFolderAttribute,
  AvatarAppearanceInstance, AvatarAppearanceAttribute
} from './mysql';

import { UUIDString } from '../lib/UUID';

export class Inventory {
  private user: string;
  private items: Sequelize.Model<InventoryItemInstance, InventoryItemAttribute>
  private folders: Sequelize.Model<InventoryFolderInstance, InventoryFolderAttribute>
  private appearance: Sequelize.Model<AvatarAppearanceInstance, AvatarAppearanceAttribute>

  constructor(
    userID: string,
    items: Sequelize.Model<InventoryItemInstance, InventoryItemAttribute>,
    folders: Sequelize.Model<InventoryFolderInstance, InventoryFolderAttribute>,
    appearance: Sequelize.Model<AvatarAppearanceInstance, AvatarAppearanceAttribute>
  ) {
    this.user = userID;
    this.items = items;
    this.folders = folders;
    this.appearance = appearance;
  }

  cloneInventoryOnto(destination: string): Promise<void> {
    let folders: InventoryFolderInstance[];
    let items: InventoryItemInstance[];
    let uuidMap: { [key: string]: string } = {};
    return this.destroy(destination).then(() => {
      return this.folders.findAll({
        where: {
          agentID: this.user
        }
      })
    }).then((res: InventoryFolderInstance[]) => {
      folders = res;
      return this.items.findAll({
        where: {
          avatarID: this.user
        }
      })
    }).then((res: InventoryItemInstance[]) => {
      items = res;
    }).then(() => {
      // generate uuid map

      for (let f of folders) {
        uuidMap[f.folderID] = UUIDString.random().toString();
        uuidMap[f.parentFolderID] = UUIDString.random().toString();
      }
      for (let i of items) {
        uuidMap[i.inventoryID] = UUIDString.random().toString();
      }
      // UUID zero is special and needs to stick
      uuidMap[UUIDString.zero().toString()] = UUIDString.zero().toString();
    }).then(() => {
      //clone all of the folders accross
      return Promise.all(folders.map((t: InventoryFolderInstance) => {
        return this.folders.create({
          folderName: t.folderName,
          type: t.type,
          version: t.version,
          folderID: uuidMap[t.folderID],
          agentID: destination,
          parentFolderID: uuidMap[t.parentFolderID]
        })
      }))
    }).then(() => {
      //clone all of the items accross
      return Promise.all(items.map((t: InventoryItemInstance) => {
        return this.items.create({
          assetID: t.assetType == 24 ? uuidMap[t.assetID] : t.assetID,
          assetType: t.assetType,
          inventoryName: t.inventoryName,
          inventoryDescription: t.inventoryDescription,
          inventoryNextPermissions: t.inventoryNextPermissions,
          inventoryCurrentPermissions: t.inventoryCurrentPermissions,
          invType: t.invType,
          creatorID: t.creatorID,
          inventoryBasePermissions: t.inventoryBasePermissions,
          inventoryEveryOnePermissions: t.inventoryEveryOnePermissions,
          salePrice: t.salePrice,
          saleType: t.saleType,
          creationDate: t.creationDate,
          groupID: t.groupID,
          groupOwned: t.groupOwned,
          flags: t.flags,
          inventoryID: uuidMap[t.inventoryID],
          avatarID: destination,
          parentFolderID: uuidMap[t.parentFolderID],
          inventoryGroupPermissions: t.inventoryGroupPermissions
        })
      }))
    }).then(() => {
      // clone the avatar appearance
      return this.appearance.findAll({
        where: {
          Owner: this.user
        }
      })
    }).then((pieces: AvatarAppearanceInstance[]) => {
      return Promise.all(pieces.map((p: AvatarAppearanceInstance) => {
        return this.appearance.create({
          Owner: destination,
          Serial: p.Serial,
          Visual_Params: p.Visual_Params,
          Texture: p.Texture,
          Avatar_Height: p.Avatar_Height,
          Body_Item: uuidMap[p.Body_Item],
          Body_Asset: p.Body_Asset,
          Skin_Item: uuidMap[p.Skin_Item.toString()],
          Skin_Asset: p.Skin_Asset,
          Hair_Item: uuidMap[p.Hair_Item.toString()],
          Hair_Asset: p.Hair_Asset,
          Eyes_Item: uuidMap[p.Eyes_Item.toString()],
          Eyes_Asset: p.Eyes_Asset,
          Shirt_Item: uuidMap[p.Shirt_Item.toString()],
          Shirt_Asset: p.Shirt_Asset,
          Pants_Item: uuidMap[p.Pants_Item.toString()],
          Pants_Asset: p.Pants_Asset,
          Shoes_Item: uuidMap[p.Shoes_Item.toString()],
          Shoes_Asset: p.Shoes_Asset,
          Socks_Item: uuidMap[p.Socks_Item.toString()],
          Socks_Asset: p.Socks_Asset,
          Jacket_Item: uuidMap[p.Jacket_Item.toString()],
          Jacket_Asset: p.Jacket_Asset,
          Gloves_Item: uuidMap[p.Gloves_Item.toString()],
          Gloves_Asset: p.Gloves_Asset,
          Undershirt_Item: uuidMap[p.Undershirt_Item.toString()],
          Undershirt_Asset: p.Undershirt_Asset,
          Underpants_Item: uuidMap[p.Underpants_Item.toString()],
          Underpants_Asset: p.Underpants_Asset,
          Skirt_Item: uuidMap[p.Skirt_Item.toString()],
          Skirt_Asset: p.Skirt_Asset,
          alpha_item: uuidMap[p.alpha_item.toString()],
          alpha_asset: p.alpha_asset,
          tattoo_item: uuidMap[p.tattoo_item.toString()],
          tattoo_asset: p.tattoo_asset,
          physics_item: uuidMap[p.physics_item.toString()],
          physics_asset: p.physics_asset
        })
      }));
    }).then(() => { });
  }

  private destroy(target: string): Promise<void> {
    return this.folders.findAll({
      where: {
        agentID: target
      }
    }).then((folders: InventoryFolderInstance[]) => {
      return Promise.all(folders.map((f: InventoryFolderInstance) => {
        return f.destroy();
      }))
    }).then(() => {
      return this.items.findAll({
        where: {
          avatarID: target
        }
      })
    }).then((items: InventoryItemInstance[]) => {
      return Promise.all(items.map((i: InventoryItemInstance) => {
        return i.destroy();
      }))
    }).then(() => { });
  }

  /*static skeleton(owner: UUIDString): Inventory {
    let folders: Folder[] = [];
    let rootID = UUIDString.random();
    folders = [
      new Folder('My Inventory', 8, 0, rootID, owner, UUIDString.zero()),
      new Folder('Textures', 0, 0, UUIDString.random(), owner, rootID),
      new Folder('Sounds', 1, 0, UUIDString.random(), owner, rootID),
      new Folder('Calling Cards', 2, 0, UUIDString.random(), owner, rootID),
      new Folder('Landmarks', 3, 0, UUIDString.random(), owner, rootID),
      new Folder('Clothing', 5, 0, UUIDString.random(), owner, rootID),
      new Folder('Objects', 6, 0, UUIDString.random(), owner, rootID),
      new Folder('Notecards', 7, 0, UUIDString.random(), owner, rootID),
      new Folder('Scripts', 10, 0, UUIDString.random(), owner, rootID),
      new Folder('Body Parts', 13, 0, UUIDString.random(), owner, rootID),
      new Folder('Trash', 14, 0, UUIDString.random(), owner, rootID),
      new Folder('Photo Album', 15, 0, UUIDString.random(), owner, rootID),
      new Folder('Lost And Found', 16, 0, UUIDString.random(), owner, rootID),
      new Folder('Animations', 20, 0, UUIDString.random(), owner, rootID),
      new Folder('Gestures', 21, 0, UUIDString.random(), owner, rootID),
    ]
    return new Inventory(folders, []);
  }*/
}