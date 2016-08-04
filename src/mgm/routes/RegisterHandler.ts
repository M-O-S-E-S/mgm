
import * as express from 'express';
import { PendingUser, PendingUserMgr } from '../PendingUser';
import { MGM } from '../MGM';
import { UUIDString } from '../../halcyon/UUID';
import { User, UserMgr, Credential } from '../../halcyon/User';
import { EmailMgr } from '../util/Email';

export function RegisterHandler(templates: { [key: string]: string }): express.Router {
  let router: express.Router = express.Router();

  router.post('/submit', (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let template = req.body.gender;
    let password = req.body.password;
    let summary = req.body.summary;

    // FORM VALIDATION
    if (!name || !email || !template || !password || !summary) {
      return res.send(JSON.stringify({ Success: false, Message: 'Incomplete Registration Form' }));
    }

    if (name.split(' ').length != 2) {
      return res.send(JSON.stringify({ Success: false, Message: 'Invalid username' }));
    }

    if (!/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
      return res.send(JSON.stringify({ Success: false, Message: 'Invalid email' }));
    }

    if (!(template in templates)) {
      return res.send(JSON.stringify({ Success: false, Message: 'Invalid template selector' }));
    }

    if (password === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Empty password is not allowed' }));
    }

    if (summary === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Empty summary is not allowed' }));
    }

    //ensure no duplicate names
    UserMgr.instance().getUsers().then((users: User[]) => {
      for (let u of users) {
        if (u.getUsername() + ' ' + u.getLastName() === name) {
          throw new Error('Name is already in use by a registered user');
        }
      }
    }).then(() => {
      return PendingUserMgr.instance().getAll();
    }).then((users: PendingUser[]) => {
      for (let u of users) {
        if (u.getName() === name) {
          throw new Error('Name is already in use by an applicant user');
        }
      }
    }).then( () => {
      return PendingUserMgr.instance().insert(name, email, template, Credential.fromPlaintext(password), summary);
    }).then( () => {
      return EmailMgr.instance().registrationSuccessfull(name, email);
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).then(() => {
      EmailMgr.instance().notifyAdminUserPending(name, email);
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });

  });

  return router;
}
