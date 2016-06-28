

import * as mysql from 'mysql';
import {Sql} from '../mysql/sql';
import * as Promise from 'bluebird';

import { User, Credential, Appearance } from './User';
import { Inventory, Folder, Item } from './Inventory';
import { UUIDString } from './UUID';
import { Estate } from './estate';
import { Group, GroupMembership, GroupRole } from './Group';

export interface sqlConfig {
  db_host: string
  db_user: string
  db_pass: string
  db_name: string
}

export class SqlConnector {
  db: Sql

  constructor(c: sqlConfig) {
    this.db = new Sql(c);
  }

  getAllUsers(): Promise<User[]> {
    return new Promise<User[]>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM users WHERE 1', (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows)
      });
    });
  }

  getUserByEmail(email: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM users WHERE email=?', email, (err, row) => {
        if (err) return reject(err);
        if (!row || row.length !== 1)
          return reject(new Error('User ' + email + ' not found.'));
        resolve(User.fromDB(row[0]));
      })
    });
  }
  getUserByName(name: string): Promise<User> {
    let nameParts = name.split(' ');
    return new Promise<User>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM users WHERE username=? AND lastname=?', nameParts, (err, row) => {
        if (err) return reject(err);
        if (!row || row.length !== 1)
          return reject(new Error('User ' + name + ' not found.'));
        resolve(User.fromDB(row[0]));
      })
    });
  }
  getUser(id: UUIDString): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM users WHERE UUID=?', id.toString(), (err, row) => {
        if (err) return reject(err);
        if (!row || row.length !== 1)
          return reject(new Error('User ' + id.toString() + ' not found.'));
        resolve(User.fromDB(row[0]));
      })
    });
  }

  addAppearance(appearance: Appearance): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let args = {
        Owner: appearance.Owner.toString(),
        Serial: appearance.Serial,
        Visual_Params: appearance.Visual_Params,
        Texture: appearance.Texture,
        Avatar_Height: appearance.Avatar_Height,
        Body_Item: appearance.Body_Item.toString(),
        Body_Asset: appearance.Body_Asset.toString(),
        Skin_Item: appearance.Skin_Item.toString(),
        Skin_Asset: appearance.Skin_Asset.toString(),
        Hair_Item: appearance.Hair_Item.toString(),
        Hair_Asset: appearance.Hair_Asset.toString(),
        Eyes_Item: appearance.Eyes_Item.toString(),
        Eyes_Asset: appearance.Eyes_Asset.toString(),
        Shirt_Item: appearance.Shirt_Item.toString(),
        Shirt_Asset: appearance.Shirt_Asset.toString(),
        Pants_Item: appearance.Pants_Item.toString(),
        Pants_Asset: appearance.Pants_Asset.toString(),
        Shoes_Item: appearance.Shoes_Item.toString(),
        Shoes_Asset: appearance.Shoes_Asset.toString(),
        Socks_Item: appearance.Socks_Item.toString(),
        Socks_Asset: appearance.Socks_Asset.toString(),
        Jacket_Item: appearance.Jacket_Item.toString(),
        Jacket_Asset: appearance.Jacket_Asset.toString(),
        Gloves_Item: appearance.Gloves_Item.toString(),
        Gloves_Asset: appearance.Gloves_Asset.toString(),
        Undershirt_Item: appearance.Undershirt_Item.toString(),
        Undershirt_Asset: appearance.Undershirt_Asset.toString(),
        Underpants_Item: appearance.Underpants_Item.toString(),
        Underpants_Asset: appearance.Underpants_Asset.toString(),
        Skirt_Item: appearance.Skirt_Item.toString(),
        Skirt_Asset: appearance.Skirt_Asset.toString(),
        alpha_item: appearance.alpha_item.toString(),
        alpha_asset: appearance.alpha_asset.toString(),
        tattoo_item: appearance.tattoo_item.toString(),
        tattoo_asset: appearance.tattoo_asset.toString(),
        physics_item: appearance.physics_item.toString(),
        physics_asset: appearance.physics_asset.toString(),
      }
      this.db.pool.query('INSERT INTO avatarappearance SET ?', args, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  getAppearance(id: UUIDString): Promise<Appearance> {
    return new Promise<Appearance>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM avatarappearance WHERE Owner=?', id.toString(), (err, row) => {
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

  getInventory(id: UUIDString): Promise<Inventory> {
    return new Promise<Inventory>((resolve, reject) => {
      let folders: Folder[] = [];
      let items: Item[] = [];
      this.db.pool.query('SELECT * FROM inventoryfolders WHERE agentID=?', id.toString(), (err, rows) => {
        if (err) return reject(err);
        for (let r of rows) {
          folders.push(new Folder(
            r.folderName,
            r.type,
            r.version,
            new UUIDString(r.folderID),
            new UUIDString(r.agentID),
            new UUIDString(r.parentFolderID)
          ));
        }
        this.db.pool.query('SELECT * FROM inventoryitems WHERE avatarID=?', id.toString(), (err, rows) => {
          if (err) return reject(err);
          for (let r of rows) {
            let i: Item = new Item();
            i.assetID = new UUIDString(r.assetID);
            i.assetType = r.assetType;
            i.inventoryName = r.inventoryName;
            i.inventoryDescription = r.inventoryDescription;
            i.inventoryNextPermissions = r.inventoryNextPermissions;
            i.inventoryCurrentPermissions = r.inventoryCurrentPermissions;
            i.invType = r.invType;
            i.creatorID = new UUIDString(r.creatorID);
            i.inventoryBasePermissions = r.inventoryBasePermissions;
            i.inventoryEveryOnePermissions = r.inventoryEveryOnePermissions;
            i.salePrice = r.salePrice;
            i.saleType = r.saleType;
            i.creationDate = r.creationDate;
            i.groupID = r.groupID;
            i.groupOwned = r.groupOwned;
            i.flags = r.flags;
            i.inventoryID = new UUIDString(r.inventoryID);
            i.avatarID = new UUIDString(r.avatarID);
            i.parentFolderID = new UUIDString(r.parentFolderID);
            i.inventoryGroupPermissions = r.inventoryGroupPermissions;
            items.push(i);
          }
          resolve(new Inventory(folders, items));
        });
      })
    });
  }

  deleteUser(user: UUIDString): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query("DELETE FROM users WHERE UUID=?", user.toString(), (err) => {
        if (err) return reject(err);

        this.db.pool.query("DELETE FROM avatarappearance WHERE Owner=?", user.toString(), (err) => {
          if (err) return reject(err);

          this.db.pool.query("DELETE FROM inventoryfolders WHERE agentID=?", user.toString(), (err) => {
            if (err) return reject(err);

            this.db.pool.query("DELETE FROM inventoryitems WHERE avatarID=?", user.toString(), (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        });
      })
    });
  }

  setUserPassword(userID: string, cred: Credential): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('UPDATE users SET passwordHash=? WHERE UUID=?', [cred.hash, userID], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  addUser(user: User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let args = {
        UUID: user.UUID.toString(),
        username: user.username,
        lastname: user.lastname,
        passwordHash: user.passwordHash.hash,
        passwordSalt: '',
        created: Math.round(new Date().getTime() / 1000.0),
        lastLogin: 0,
        godLevel: user.godLevel,
        iz_level: user.iz_level,
        email: user.email,
        /* these fields are required, but we dont have sane ways to configure them */
        homeRegion: 1099511628032000,
        homeLocationX: 128,
        homeLocationY: 128,
        homeLocationZ: 100,
        homeLookAtX: 100,
        homeLookAtY: 100,
        homeLookAtZ: 100,
        userInventoryURI: user.userInventoryURI || '',
        userAssetURI: user.userAssetURI || '',
        profileImage: user.profileImage.toString() || UUIDString.zero().toString(),
        profileFirstImage: user.profileFirstImage.toString() || UUIDString.zero().toString(),
        webLoginKey: user.webLoginKey.toString() || UUIDString.zero().toString(),
        profileAboutText: user.profileAboutText || '',
        profileFirstText: user.profileFirstText || '',
        profileURL: user.profileURL || '',
        profileCanDoMask: user.profileCanDoMask,
        profileWantDoMask: user.profileWantDoMask
      }
      this.db.pool.query('INSERT INTO users SET ?', args, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  setGodLevel(user: User, level: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('UPDATE users SET godLevel=? WHERE UUID=?', [level, user.UUID.toString()], err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  setEmail(user: User, email: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('UPDATE users SET email=? WHERE UUID=?', [email, user.UUID.toString()], err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  deleteInventory(u: User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('DELETE FROM inventoryfolders WHERE agentID=?', u.UUID.toString(), (err) => {
        if (err) return reject(err);

        this.db.pool.query('DELETE FROM inventoryitems WHERE avatarID=?', u.UUID.toString(), (err) => {
          if (err) return reject(err);

          resolve();
        });
      });
    });
  }

  addInventory(inventory: Inventory): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      //push all of the inventory folders in first
      let folders = inventory.getFolders();
      let query = 'INSERT INTO inventoryfolders (folderName, type, version, folderID, agentID, parentFolderID) VALUES ?';
      let values = [];
      for (let f of folders) {
        values.push([f.folderName, f.Type, f.version, f.folderID.toString(), f.agentID.toString(), f.parentFolderID.toString()]);
      }
      this.db.pool.query(query, [values], (err: mysql.IError) => {
        if (err) return reject(err);

        //once folders are inserted, insert items
        let items = inventory.getItems();
        let tasks = items.map((i: Item) => {
          if(i.assetID === undefined){
            console.log(i);
          }
          return new Promise<void>((resolve, reject) => {
            this.db.pool.query('INSERT INTO inventoryitems SET ?', {
              assetID: i.assetID.toString(),
              assetType: i.assetType,
              inventoryName: i.inventoryName,
              inventoryDescription: i.inventoryDescription || 'description',
              inventoryNextPermissions: i.inventoryNextPermissions,     //???
              inventoryCurrentPermissions: i.inventoryCurrentPermissions,  //???
              invType: i.invType,
              creatorID: i.creatorID.toString(),
              inventoryBasePermissions: i.inventoryBasePermissions || 647168,     //???
              inventoryEveryOnePermissions: i.inventoryEveryOnePermissions || 0, //???
              salePrice: i.salePrice || 0,
              saleType: i.saleType || 0,
              creationDate: i.creationDate,
              groupID: i.groupID.toString(),
              groupOwned: i.groupOwned || 0,
              flags: i.flags || 0,
              inventoryID: i.inventoryID.toString(),
              avatarID: i.avatarID.toString(),
              parentFolderID: i.parentFolderID.toString(),
              inventoryGroupPermissions: i.inventoryGroupPermissions || 0
            }, (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        });
        Promise.all(tasks).then(() => {
          resolve();
        }).catch((err) => {
          reject(err);
        })
      });
    });
  }

  private getManagersForEstate(id: number): Promise<UUIDString[]> {
    return new Promise<UUIDString[]>((resolve, reject) => {
      this.db.pool.query('SELECT uuid FROM estate_managers WHERE EstateID=?', id, (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows);
      })
    }).then((rows: any[]) => {
      let ids: UUIDString[] = [];
      for (let r of rows) {
        ids.push(new UUIDString(r.uuid));
      }
      return ids;
    });
  }

  private getRegionsForEstate(id: number): Promise<UUIDString[]> {
    return new Promise<UUIDString[]>((resolve, reject) => {
      this.db.pool.query('SELECT RegionID FROM estate_map WHERE EstateID=?', id, (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows);
      })
    }).then((rows: any[]) => {
      let ids: UUIDString[] = [];
      for (let r of rows) {
        ids.push(new UUIDString(r.RegionID));
      }
      return ids;
    });
  }

  setEstateForRegion(regionID: string, e: Estate): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('INSERT INTO estate_map (RegionID, EstateID) VALUES (?,?) ON DUPLICATE KEY UPDATE EstateID=?', [regionID, e.id, e.id], (err, rows: any[]) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  getEstate(estateID: number): Promise<Estate> {
    return new Promise<Estate[]>((resolve, reject) => {
      this.db.pool.query('SELECT EstateID, EstateName, EstateOwner FROM estate_settings WHERE EstateID=?', estateID, (err, rows: any[]) => {
        if (err) return reject(err);
        if (!rows || rows.length !== 1) return reject(new Error('Estate does not exist'));
        resolve(rows[0]);
      });
    }).then((r: any) => {
      let workers = [];
      let e = new Estate();
      e.id = r.EstateID;
      e.name = r.EstateName;
      e.owner = new UUIDString(r.EstateOwner);
      workers.push(this.getManagersForEstate(e.id).then((managers: UUIDString[]) => {
        e.managers = managers;
      }));
      workers.push(this.getRegionsForEstate(e.id).then((regions: UUIDString[]) => {
        e.regions = regions;
      }));
      return Promise.all(workers).then(() => {
        return e;
      });
    });
  }

  insertEstate(e: Estate): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let args = {
        EstateName: e.name,
        EstateOwner: e.owner.toString(),
        AbuseEmailToEstateOwner: 0,
        DenyAnonymous: 1,
        ResetHomeOnTeleport: 0,
        FixedSun: 0,
        DenyTransacted: 0,
        BlockDwell: 0,
        DenyIdentified: 0,
        AllowVoice: 0,
        UseGlobalTime: 1,
        PricePerMeter: 0,
        TaxFree: 1,
        AllowDirectTeleport: 1,
        RedirectGridX: 0,
        RedirectGridY: 0,
        ParentEstateID: 0,
        SunPosition: 0,
        EstateSkipScripts: 0,
        BillableFactor: 0,
        PublicAccess: 1,
        AbuseEmail: '',
        DenyMinors: 0,
      }
      this.db.pool.query('INSERT INTO estate_settings SET ?', args, err => {
        if (err) return reject(err);
        resolve();
      })
    });
  }

  destroyEstate(e: Estate): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('DELETE FROM estateban WHERE EstateID=?', e.id, (err) => {
        if (err) return reject(err);
        resolve();
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM estate_groups WHERE EstateID=?', e.id, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM estate_managers WHERE EstateID=?', e.id, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM estate_map WHERE EstateID=?', e.id, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM estate_settings WHERE EstateID=?', e.id, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM estate_users WHERE EstateID=?', e.id, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    })
  }

  getEstates(): Promise<Estate[]> {
    return new Promise<Estate[]>((resolve, reject) => {
      this.db.pool.query('SELECT EstateID, EstateName, EstateOwner FROM estate_settings WHERE 1', (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      let estates: Estate[] = [];
      let workers = [];
      for (let r of rows) {
        let e = new Estate();
        e.id = r.EstateID;
        e.name = r.EstateName;
        e.owner = new UUIDString(r.EstateOwner);
        workers.push(this.getManagersForEstate(e.id).then((managers: UUIDString[]) => {
          e.managers = managers;
        }));
        workers.push(this.getRegionsForEstate(e.id).then((regions: UUIDString[]) => {
          e.regions = regions;
        }));
        estates.push(e);
      }
      return Promise.all(workers).then(() => {
        return estates;
      });
    });
  }

  private getRolesForGroup(groupID: UUIDString): Promise<GroupRole[]> {
    return new Promise<GroupRole[]>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM osrole WHERE GroupID=?', groupID.toString(), (err, rows: any[]) => {
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
      return roles;
    });
  }

  private getMembersForGroup(groupID: UUIDString): Promise<GroupMembership[]> {
    return new Promise<GroupMembership[]>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM osgroupmembership WHERE GroupID=?', groupID.toString(), (err, rows: any[]) => {
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
        m.SelectedRoldeID = new UUIDString(r.SelectedRoleID);
        m.Contribution = r.Contribution;
        m.ListInProfile = r.ListInProfile;
        m.AcceptNotices = r.AcceptNotices;
        members.push(m);
      }
      return members;
    })
  }

  addMemberToGroup(group: Group, user: User, roleID: UUIDString): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query(
        'INSERT INTO osgroupmembership (GroupID, AgentID, SelectedRoleID, Contribution, ListInProfile, AcceptNotices) VALUES (?,?,?,0,1,1)',
        [group.GroupID.toString(), user.UUID.toString(), roleID.toString()],
        (err, rows: any[]) => {
          if (err)
            return reject(err);
          resolve();
        });
    });
  }

  removeMemberFromGroup(group: Group, user: User): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query(
        'DELETE FROM osgroupmembership WHERE GroupID=? AND AgentID=?',
        [group.GroupID.toString(), user.UUID.toString()],
        (err, rows: any[]) => {
          if (err)
            return reject(err);
          resolve();
        });
    });
  }

  getGroupByUUID(id: UUIDString): Promise<Group> {
    return new Promise<Group>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM osgroup WHERE GroupID=?', id.toString(), (err, rows: any[]) => {
        if (err)
          return reject(err);
        if (!rows || rows.length != 1) {
          return reject(new Error('Group does not exist'));
        }
        resolve(rows[0]);
      });
    }).then((r: any) => {
      let g = new Group();
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
      return g;
    }).then((group: Group) => {
      return this.getRolesForGroup(group.GroupID).then((roles: GroupRole[]) => {
        group.Roles = roles;
      }).then(() => {
        return group;
      })
    }).then((group: Group) => {
      return this.getMembersForGroup(group.GroupID).then((members: GroupMembership[]) => {
        group.Members = members;
      }).then(() => {
        return group;
      })
    });
  }

  getGroups(): Promise<Group[]> {
    return new Promise<Group[]>((resolve, reject) => {
      this.db.pool.query('SELECT * FROM osgroup', (err, rows: any[]) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    }).then((rows: any[]) => {
      let groups: Group[] = [];
      for (let r of rows) {
        let g = new Group();
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
        groups.push(g);
      }
      return groups;
    }).then((groups: Group[]) => {
      return Promise.all(groups.map((g: Group) => {
        return this.getRolesForGroup(g.GroupID).then((roles: GroupRole[]) => {
          g.Roles = roles;
        })
      })).then(() => {
        return groups;
      })
    }).then((groups: Group[]) => {
      return Promise.all(groups.map((g: Group) => {
        return this.getMembersForGroup(g.GroupID).then((members: GroupMembership[]) => {
          g.Members = members;
        });
      })).then(() => {
        return groups;
      })
    });
  }

  destroyRegion(uuid: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.pool.query('DELETE FROM allparcels WHERE regionUUID=?', uuid, (err) => {
        if (err) return reject(err);
        resolve();
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM estate_map WHERE RegionID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM land WHERE RegionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM landaccesslist WHERE LandUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM objects WHERE regionuuid=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM parcels WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM parcelsales WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM primitems WHERE primID in (SELECT UUID FROM prims WHERE RegionUUID=?)', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM primshapes WHERE UUID in (SELECT UUID FROM prims WHERE RegionUUID=?)', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM prims WHERE RegionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM prims_copy_temps WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM regionenvironment WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM parcelsales WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM RegionRdbMapping WHERE region_id=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM regions WHERE uuid=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM regionsettings WHERE regionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM telehubs WHERE RegionID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.db.pool.query('DELETE FROM terrain WHERE RegionUUID=?', uuid, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }
}
