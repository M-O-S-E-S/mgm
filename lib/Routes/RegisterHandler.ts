import { RequestHandler } from 'express';
import { Store } from '../Store';
import { IUser, IPendingUser } from '../types';
import { AuthenticatedRequest } from '../Auth';

import { EmailMgr } from '../Email';
import { Credential } from '../Auth';

export function RegisterHandler(store: Store, templates: { [key: string]: string }): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let name: string = req.body.name;
    let email: string = req.body.email;
    let template: string = req.body.gender;
    let password: string = req.body.password;
    let summary: string = req.body.summary;

    // FORM VALIDATION
    if (!name || !email || !template || !password || !summary) {
      return res.json({ Success: false, Message: 'Incomplete Registration Form' });
    }

    if (name.split(' ').length != 2) {
      return res.json({ Success: false, Message: 'Invalid username' });
    }

    if (!/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
      return res.json({ Success: false, Message: 'Invalid email' });
    }

    if (!(template in templates)) {
      return res.json({ Success: false, Message: 'Invalid template selector' });
    }

    if (password === '') {
      return res.json({ Success: false, Message: 'Empty password is not allowed' });
    }

    if (summary === '') {
      return res.json({ Success: false, Message: 'Empty summary is not allowed' });
    }

    //ensure no duplicate names
    store.Users.getAll().then((users: IUser[]) => {
      for (let u of users) {
        if (u.username.toLowerCase() + ' ' + u.lastname.toLowerCase() === name.toLowerCase()) {
          throw new Error('Name is already in use by a registered user');
        }
      }
    }).then(() => {
      return store.PendingUsers.getAll();
    }).then((users: IPendingUser[]) => {
      for (let u of users) {
        if (u.name.toLowerCase() === name.toLowerCase()) {
          throw new Error('Name is already in use by an applicant user');
        }
        if (u.email === email) {
          throw new Error('registration emails must be unique');
        }
      }
    }).then(() => {
      return store.PendingUsers.create(name, email, template, Credential.fromPlaintext(password), summary);
    }).then(() => {
      return EmailMgr.instance().registrationSuccessfull(name, email);
    }).then(() => {
      res.json({ Success: true });
    }).then(() => {
      EmailMgr.instance().notifyAdminUserPending(name, email);
    }).catch((err: Error) => {
      console.log(err);
      res.json({ Success: false, Message: err.message });
    });
  };
}
