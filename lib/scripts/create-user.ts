
function help() {
  console.log('Create User script for Halcyon');
  console.log('------------------------------');
  console.log('usage: node create-user.js username lastname email password <user-level>');
  console.log('user-levels:');
  console.log(' 0: suspended');
  console.log(' 1: temporary <default>');
  console.log(' 2-49: resident');
  console.log(' 50-199: group owner');
  console.log(' 200-249: grid god');
  console.log(' 250-255: mgm administrator');

  process.exit(1);
}

if (process.argv.length < 6 || process.argv.length > 7) {
  help();
}

if (process.argv[2] === 'help' || process.argv[2] === '--help' || process.argv[2] === '-h') {
  help();
}

let username: string = process.argv[2];
let lastname: string = process.argv[3];
let email: string = process.argv[4];
let password: string = process.argv[5];
let userLevel: number = process.argv.length === 7 ? parseInt(process.argv[6]) : 1;

// validate input
username = username.trim().split(' ')[0];
if (username === '') {
  console.log('Invalid user, username is required, and is a single string without whitespace');
  help();
}

lastname = lastname.trim().split(' ')[0];
if (lastname === '') {
  console.log('Invalid user, lastname is required, and is a single string without whitespace');
  help();
}

email = email.trim().split(' ')[0];
// email is not an index nor a key, so we really dont care

password = password.trim().split(' ')[0];
if (password === '') {
  console.log('Invalid user, password is required, and is a single string without whitespace');
  help();
}

if (userLevel < 0 || userLevel > 255) {
  console.log('Invalid user, user-level is not valid');
  help();
}

// create user
import { Config, Validate } from '../Config';
let conf: Config = require('../../settings.js');
if (!Validate(conf)) {
}

import { getStore, Store } from '../Store';
let store: Store = getStore(conf.mgmdb, conf.haldb);

console.log('Creating user ' + username + ' ' + lastname + ' with email ' + email + ' identified by ' + password + ' with god level ' + userLevel);

import { IUser } from '../types';
import { Credential } from '../Auth';

store.Users.createUserFromSkeleton(username, lastname, Credential.fromPlaintext(password), email).then((u: IUser) => {
  return store.Users.setAccessLevel(u, userLevel);
}).then((u: IUser) => {
  console.log('User Created with UUID: ' + u.UUID);
  process.exit(0);
}).catch( (err: Error) => {
  console.log('Error creating user: ' + err.message);
  process.exit(1);
})