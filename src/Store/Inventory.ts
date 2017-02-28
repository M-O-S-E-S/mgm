
import { IPool } from 'promise-mysql';
import { Store } from '.';
import { UUID } from '../lib';
import { IUser } from '../Types';

function wipeInventory(db: IPool, user: IUser): Promise<void> {
  return Promise.resolve().then( () => {
    return db.query('DELETE FROM inventoryfolders WHERE agentID=?', user.UUID)
  }).then(() => {
    return db.query('DELETE FROM inventoryitems WHERE avatarID=?', user.UUID);
  }).then(() => {
    return db.query('DELETE FROM avatarappearance WHERE Owner=?', user.UUID);
  }).then(() => {
    return db.query('DELETE FROM avatarattachments WHERE UUID=?', user.UUID);
  });
}

export function ApplySkeleton(db: IPool, user: IUser): Promise<IUser> {
  let rootID = UUID.random().toString();

  return wipeInventory(db, user).then(() => {
    let values: inventoryFolder[] = [
      { folderName: 'My Inventory', type: 8, version: 0, folderID: rootID, agentID: user.UUID, parentFolderID: UUID.zero().toString() },
      { folderName: 'Textures', type: 0, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Sounds', type: 1, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Calling Cards', type: 2, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Landmarks', type: 3, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Clothing', type: 5, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Objects', type: 6, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Notecards', type: 7, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Scripts', type: 10, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Body Parts', type: 13, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Trash', type: 14, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Photo Album', type: 15, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Lost And Found', type: 16, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Animations', type: 20, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID },
      { folderName: 'Gestures', type: 21, version: 0, folderID: UUID.random().toString(), agentID: user.UUID, parentFolderID: rootID }
    ];
    return Promise.all(values.map((r: inventoryFolder) => {
      return db.query('INSERT INTO inventoryfolders SET ?', r);
    }));
  }).then(() => {
    return user;
  });
}

interface inventoryFolder {
  folderName: string
  type: number
  version: number
  folderID: string
  agentID: string
  parentFolderID: string
}

interface inventoryItem {
  assetID: string
  assetType: number
  inventoryName: string
  inventoryDescription: string
  inventoryNextPermissions: number
  inventoryCurrentPermissions: number
  invType: number
  creatorID: string
  inventoryBasePermissions: number
  inventoryEveryOnePermissions: number
  salePrice: number
  saleType: number
  creationDate: number
  groupID: string
  groupOwned: number
  flags: number
  inventoryID: string
  avatarID: string
  parentFolderID: string
  inventoryGroupPermissions: string
}

interface avatarAppearance {
  Owner: string
  Serial: number
  Visual_Params: string
  Texture: string
  Avatar_Height: number
  Body_Item: string
  Body_Asset: string
  Skin_Item: string
  Skin_Asset: string
  Hair_Item: string
  Hair_Asset: string
  Eyes_Item: string
  Eyes_Asset: string
  Shirt_Item: string
  Shirt_Asset: string
  Pants_Item: string
  Pants_Asset: string
  Shoes_Item: string
  Shoes_Asset: string
  Socks_Item: string
  Socks_Asset: string
  Jacket_Item: string
  Jacket_Asset: string
  Gloves_Item: string
  Gloves_Asset: string
  Undershirt_Item: string
  Undershirt_Asset: string
  Underpants_Item: string
  Underpants_Asset: string
  Skirt_Item: string
  Skirt_Asset: string
  alpha_item: string
  alpha_asset: string
  tattoo_item: string
  tattoo_asset: string
  physics_item: string
  physics_asset: string
}

interface attachment {
  UUID: string
  attachpoint: number
  item: string
  asset: string
}

export function CloneFrom(db: IPool, target: IUser, template: IUser): Promise<IUser> {
  let uuidMap: { [key: string]: string } = {}
  let invMap: { [key: string]: string } = {};

  return wipeInventory(db, target).then(() => {
    // read folders, and generate the uuid map
    return db.query('SELECT * FROM inventoryfolders WHERE agentID=?', template.UUID);
  }).then((rows: inventoryFolder[]) => {
    // insert into the map
    rows.map((r: inventoryFolder) => {
      uuidMap[r.folderID] = UUID.random().toString();
    });

    // uuid zero is special and can't map anywhere else
    uuidMap[UUID.zero().toString()] = UUID.zero().toString();
    return Promise.all(rows.map((r: inventoryFolder) => {
      let v: inventoryFolder = {
        folderName: r.folderName,
        type: r.type,
        version: 0,
        folderID: uuidMap[r.folderID],
        agentID: target.UUID,
        parentFolderID: uuidMap[r.parentFolderID]
      }
      return db.query('INSERT INTO inventoryfolders SET ?', v);
    }))
  }).then(() => {
    // read items
    return db.query('SELECT * FROM inventoryitems WHERE avatarID=?', template.UUID);
  }).then((rows: inventoryItem[]) => {
    // generate a mini-map for inventory IDs.  This is needed for asset type 24 which is a reference
    rows.map((r: inventoryItem) => {
      invMap[r.inventoryID] = UUID.random().toString();
    })
    // UUID zero is special here too
    invMap[UUID.zero().toString()] = UUID.zero().toString();
    return Promise.all(rows.map((r: inventoryItem) => {
      let v: inventoryItem = {
        assetID: r.assetType == 24 ? uuidMap[r.assetID] : r.assetID,  // type 24 is a link
        assetType: r.assetType,
        inventoryName: r.inventoryName,
        inventoryDescription: r.inventoryDescription,
        inventoryNextPermissions: r.inventoryNextPermissions,
        inventoryCurrentPermissions: r.inventoryCurrentPermissions,
        invType: r.invType,
        creatorID: r.creatorID,
        inventoryBasePermissions: r.inventoryBasePermissions,
        inventoryEveryOnePermissions: r.inventoryEveryOnePermissions,
        salePrice: r.salePrice,
        saleType: r.saleType,
        creationDate: r.creationDate,
        groupID: r.groupID,
        groupOwned: r.groupOwned,
        flags: r.flags,
        inventoryID: invMap[r.inventoryID],
        avatarID: target.UUID,
        parentFolderID: uuidMap[r.parentFolderID],
        inventoryGroupPermissions: r.inventoryGroupPermissions
      }
      return db.query('INSERT INTO inventoryitems SET ?', v);
    }))
  }).then(() => {
    // copy the avatar appearance
    return db.query('SELECT * FROM avatarappearance WHERE Owner=?', template.UUID);
  }).then((rows: avatarAppearance[]) => {
    // this is 1 per account, so we only use the first
    let t = rows[0];
    // copy it over in case there are dangling mysql properties
    let appearance: avatarAppearance = {
      Owner: target.UUID,
      Serial: t.Serial,
      Visual_Params: t.Visual_Params,
      Texture: t.Texture,
      Avatar_Height: t.Avatar_Height,
      Body_Item: invMap[t.Body_Item],
      Body_Asset: t.Body_Asset,
      Skin_Item: invMap[t.Skin_Item],
      Skin_Asset: t.Skin_Asset,
      Hair_Item: invMap[t.Hair_Item],
      Hair_Asset: t.Hair_Asset,
      Eyes_Item: invMap[t.Eyes_Item],
      Eyes_Asset: t.Eyes_Asset,
      Shirt_Item: invMap[t.Shirt_Item],
      Shirt_Asset: t.Shirt_Asset,
      Pants_Item: invMap[t.Pants_Item],
      Pants_Asset: t.Pants_Asset,
      Shoes_Item: invMap[t.Shoes_Item],
      Shoes_Asset: t.Shoes_Asset,
      Socks_Item: invMap[t.Socks_Item],
      Socks_Asset: t.Socks_Asset,
      Jacket_Item: invMap[t.Jacket_Item],
      Jacket_Asset: t.Jacket_Asset,
      Gloves_Item: invMap[t.Gloves_Item],
      Gloves_Asset: t.Gloves_Asset,
      Undershirt_Item: invMap[t.Undershirt_Item],
      Undershirt_Asset: t.Undershirt_Asset,
      Underpants_Item: invMap[t.Underpants_Item],
      Underpants_Asset: t.Underpants_Asset,
      Skirt_Item: invMap[t.Skirt_Item],
      Skirt_Asset: t.Skirt_Asset,
      alpha_item: invMap[t.alpha_item],
      alpha_asset: t.alpha_asset,
      tattoo_item: invMap[t.tattoo_item],
      tattoo_asset: t.tattoo_asset,
      physics_item: invMap[t.physics_item],
      physics_asset: t.physics_asset
    }
    return db.query('INSERT INTO avatarappearance SET ?', appearance);
  }).then(() => {
    // copy the avatar attachments
    return db.query('SELECT * FROM avatarattachments WHERE UUID=?', template.UUID);
  }).then((rows: attachment[]) => {
    return Promise.all(rows.map((r: attachment) => {
      let v: attachment = {
        UUID: target.UUID,
        attachpoint: r.attachpoint,
        item: invMap[r.item],
        asset: r.asset
      }
      return db.query('INSERT INTO avatarattachments SET ?', v)
    }))
  }).then(() => {
    return target;
  })
}
