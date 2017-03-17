
import { RedisClient, ClientOpts, createClient } from 'redis';
import Promise = require('bluebird');

import { Store } from '../Store';
import { GetUserPermissions } from './Permissions';
import { UserDetail } from '.';

import { IUser } from '../types';

export class Session {
  private redis: RedisClient;
  private store: Store;

  constructor(opts: ClientOpts, store: Store) {
    this.redis = createClient(opts);
    this.store = store;
  }

  startSession(user: IUser): Promise<UserDetail> {
    return GetUserPermissions(this.store, user).then((detail: UserDetail) => {
      return new Promise<UserDetail>((resolve, reject) => {
        let args: any[] = ['session', user.UUID, JSON.stringify(detail)];
        this.redis.hset(args, (err: Error, reply) => {
          if (err) return reject(err);
          resolve(detail);
        });
      });
    });
  }

  getSession(user: IUser): Promise<UserDetail> {
    return new Promise<UserDetail>( (resolve, reject) => {
      this.redis.hget('session', user.UUID, (err: Error, reply: string) => {
        if(err) return reject(err);
        resolve(JSON.parse(reply));
      });
    });
  }

  updateSession(user: IUser): Promise<UserDetail> {
    return this.startSession(user);
  }

  endSession(user: IUser): Promise<void> {
    return new Promise<void>( (resolve, reject) => {
      this.redis.hdel(['session', user.UUID], (err: Error) => {
        if(err) return reject(err);
        resolve();
      });
    });
  }
}