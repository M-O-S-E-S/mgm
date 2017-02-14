
import * as express from 'express';
import { Credential, UUIDString } from '../lib';
import { PersistanceLayer, UserInstance, EstateInstance, ManagerInstance, EstateMapInstance } from '../database';
import { LoginResponse } from '../common/messages';
import { Set } from 'immutable';

import * as jwt from 'jsonwebtoken';
import * as multer from 'multer';

import { UserDetail, AuthenticatedRequest } from '.';

export function AuthHandler(db: PersistanceLayer, cert: Buffer, isUser: any): express.Router {
  let router: express.Router = express.Router();

  /**
   * Generate a UserDetail for a given UUID.
   * 
   * User validity and suspension is also checked here, as this is used more often than in Auth.
   */
  function getUserPermissions(uuid: string): Promise<UserDetail> {
    let user: UserInstance;
    let isAdmin: boolean = false;
    let allowEstates = Set<number>();
    let allowRegions = Set<string>();
    return db.Users.getByID(uuid)
      .then((u: UserInstance) => {
        if (!u || u.isSuspended())
          throw new Error('Invalid user for permissions');
        if (u.isAdmin())
          isAdmin = true;
        user = u;
        return db.Estates.getAll();
      }).then((estates: EstateInstance[]) => {
        estates.map((e: EstateInstance) => {
          if (isAdmin || e.EstateOwner === uuid)
            allowEstates = allowEstates.add(e.EstateID);
        });
        return db.Estates.getManagers();
      }).then((managers: ManagerInstance[]) => {
        managers.map((manager: ManagerInstance) => {
          if (manager.uuid === uuid)
            allowEstates = allowEstates.add(manager.EstateId);
        });
        return db.Estates.getMapping();
      }).then((mapping: EstateMapInstance[]) => {
        mapping.map((emap: EstateMapInstance) => {
          if (allowEstates.contains(emap.EstateID))
            allowRegions = allowRegions.add(emap.RegionID);
        });
      }).then(() => {
        console.log(allowRegions.size);
        return {
          uuid: user.UUID,
          name: user.username + ' ' + user.lastname,
          isAdmin: user.isAdmin(),
          email: user.email,
          estates: allowEstates.toArray(),
          regions: allowRegions.toArray()
        }
      });
  }

  //resume session and refresh token
  router.get('/', isUser, (req: AuthenticatedRequest, res) => {
    let userDetail: UserDetail;
    getUserPermissions(req.user.uuid).then((userDetail: UserDetail) => {
      jwt.sign(
        userDetail,
        cert,
        {
          expiresIn: '1d'
        },
        (err: Error, newToken: string) => {
          if (err) {
            console.log('Resume session failed: ' + err.message);
            return res.send(JSON.stringify({
              Success: false,
              Message: err.message
            }));
          }

          let resp: LoginResponse = {
            Success: true,
            uuid: userDetail.uuid,
            username: userDetail.name,
            isAdmin: userDetail.isAdmin,
            email: userDetail.email,
            token: newToken
          }
          res.send(JSON.stringify(resp));
        }
      );
    }).catch((err:Error) => {
      res.send(JSON.stringify({
        Success: false,
        Message: err.message
      }));
    });
  });

  router.get('/logout', isUser, (req: AuthenticatedRequest, res) => {
    res.send(JSON.stringify({
      Success: true
    }));
  });

  /**
   * Authentication endpoint, and originator of the users JWT contents
   * 
   * This is not the only location where the users permissions is set in the token.
   * The token refresh mechanisms also update this information, allowing permissions
   * to update as a user churns their tokens.  Token expiration must be kept short for this reason.
   */
  router.post('/login', multer().array(''), (req, res) => {
    let auth = req.body;
    let username: string = auth.username || '';
    let password: string = auth.password || '';
    let candidateUser: UserInstance;
    db.Users.getByName(username).then((u: UserInstance) => {
      if (Credential.fromHalcyon(u.passwordHash).compare(password)) {

        if (u.isSuspended()) {
          throw new Error('Account Suspended');
        } else {
          candidateUser = u;
        }
      } else {
        throw new Error('Invalid Credentials');
      }
    }).then(() => {
      return getUserPermissions(candidateUser.UUID);
    }).then( (ud: UserDetail) => {
      return jwt.sign(
        ud,
        cert,
        {
          expiresIn: '1d'
        }
      );
    }).then((token: string) => {
      let resp: LoginResponse = {
        Success: true,
        uuid: candidateUser.UUID,
        username: candidateUser.username + ' ' + candidateUser.lastname,
        isAdmin: candidateUser.isAdmin(),
        email: candidateUser.email,
        token: token
      }
      res.send(JSON.stringify(resp));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/changePassword', isUser, (req: AuthenticatedRequest, res: express.Response) => {
    let password: string = req.body.password || '';

    if (password === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Password cannot be blank' }));
    }

    let credential = Credential.fromPlaintext(password);

    db.Users.getByID(req.user.uuid).then((u: UserInstance) => {
      u.passwordHash = credential.hash;
      return u.save();
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      console.log('Error updating user password: ' + err.message);
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
