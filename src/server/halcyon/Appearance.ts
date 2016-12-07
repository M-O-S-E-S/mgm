
import {UUIDString} from './UUID';
import { Sql } from '../mysql/sql';

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

  save(db: Sql): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let args = {
        Owner: this.Owner.toString(),
        Serial: this.Serial,
        Visual_Params: this.Visual_Params,
        Texture: this.Texture,
        Avatar_Height: this.Avatar_Height,
        Body_Item: this.Body_Item.toString(),
        Body_Asset: this.Body_Asset.toString(),
        Skin_Item: this.Skin_Item.toString(),
        Skin_Asset: this.Skin_Asset.toString(),
        Hair_Item: this.Hair_Item.toString(),
        Hair_Asset: this.Hair_Asset.toString(),
        Eyes_Item: this.Eyes_Item.toString(),
        Eyes_Asset: this.Eyes_Asset.toString(),
        Shirt_Item: this.Shirt_Item.toString(),
        Shirt_Asset: this.Shirt_Asset.toString(),
        Pants_Item: this.Pants_Item.toString(),
        Pants_Asset: this.Pants_Asset.toString(),
        Shoes_Item: this.Shoes_Item.toString(),
        Shoes_Asset: this.Shoes_Asset.toString(),
        Socks_Item: this.Socks_Item.toString(),
        Socks_Asset: this.Socks_Asset.toString(),
        Jacket_Item: this.Jacket_Item.toString(),
        Jacket_Asset: this.Jacket_Asset.toString(),
        Gloves_Item: this.Gloves_Item.toString(),
        Gloves_Asset: this.Gloves_Asset.toString(),
        Undershirt_Item: this.Undershirt_Item.toString(),
        Undershirt_Asset: this.Undershirt_Asset.toString(),
        Underpants_Item: this.Underpants_Item.toString(),
        Underpants_Asset: this.Underpants_Asset.toString(),
        Skirt_Item: this.Skirt_Item.toString(),
        Skirt_Asset: this.Skirt_Asset.toString(),
        alpha_item: this.alpha_item.toString(),
        alpha_asset: this.alpha_asset.toString(),
        tattoo_item: this.tattoo_item.toString(),
        tattoo_asset: this.tattoo_asset.toString(),
        physics_item: this.physics_item.toString(),
        physics_asset: this.physics_asset.toString(),
      }
      db.pool.query('REPLACE INTO avatarappearance SET ?', args, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static FromDB(db: Sql, id: UUIDString): Promise<Appearance> {
    return new Promise<Appearance>((resolve, reject) => {
      db.pool.query('SELECT * FROM avatarappearance WHERE Owner=?', id.toString(), (err, row) => {
        if (err) return reject(err);
        if (!row || row.length !== 1)
          return reject(new Error('appearance for user ' + id.toString() + ' not found.'));
        let r = row[0];
        let a = new Appearance();
        a.Owner = new UUIDString(r.Owner);
        a.Serial = r.Serial;
        a.Visual_Params = r.Visual_Params;
        a.Texture = r.Texture;
        a.Avatar_Height = r.Avatar_Height;
        a.Body_Item = new UUIDString(r.Body_Item);
        a.Body_Asset = new UUIDString(r.Body_Asset);
        a.Skin_Item = new UUIDString(r.Skin_Item);
        a.Skin_Asset = new UUIDString(r.Skin_Asset);
        a.Hair_Item = new UUIDString(r.Hair_Item);
        a.Hair_Asset = new UUIDString(r.Hair_Asset);
        a.Eyes_Item = new UUIDString(r.Eyes_Item);
        a.Eyes_Asset = new UUIDString(r.Eyes_Asset);
        a.Shirt_Item = new UUIDString(r.Shirt_Item);
        a.Shirt_Asset = new UUIDString(r.Shirt_Asset);
        a.Pants_Item = new UUIDString(r.Pants_Item);
        a.Pants_Asset = new UUIDString(r.Pants_Asset);
        a.Shoes_Item = new UUIDString(r.Shoes_Item);
        a.Shoes_Asset = new UUIDString(r.Shoes_Asset);
        a.Socks_Item = new UUIDString(r.Socks_Item);
        a.Socks_Asset = new UUIDString(r.Socks_Asset);
        a.Jacket_Item = new UUIDString(r.Jacket_Item);
        a.Jacket_Asset = new UUIDString(r.Jacket_Asset);
        a.Gloves_Item = new UUIDString(r.Gloves_Item);
        a.Gloves_Asset = new UUIDString(r.Gloves_Asset);
        a.Undershirt_Item = new UUIDString(r.Undershirt_Item);
        a.Undershirt_Asset = new UUIDString(r.Undershirt_Asset);
        a.Underpants_Item = new UUIDString(r.Underpants_Item);
        a.Underpants_Asset = new UUIDString(r.Underpants_Asset);
        a.Skirt_Item = new UUIDString(r.Skirt_Item);
        a.Skirt_Asset = new UUIDString(r.Skirt_Asset);
        a.alpha_item = new UUIDString(r.alpha_item);
        a.alpha_asset = new UUIDString(r.alpha_asset);
        a.tattoo_item = new UUIDString(r.tattoo_item);
        a.tattoo_asset = new UUIDString(r.tattoo_asset);
        a.physics_item = new UUIDString(r.physics_item);
        a.physics_asset = new UUIDString(r.physics_asset);
        resolve(a);
      });
    });
  }
}
