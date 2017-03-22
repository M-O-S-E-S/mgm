
import { RedisClient, ClientOpts, createClient } from 'redis';
import Promise = require('bluebird');

import { IHost, IRegion } from './types';

export class PerformanceStore {
  private redis: RedisClient;

  constructor(opts: ClientOpts) {
    this.redis = createClient(opts);
  }

  insertHostData(h: IHost, data: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let args: any[] = ['host_stats', h.id, data];
      this.redis.hset(args, (err: Error, reply) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  getHostData(h: IHost): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.redis.hget('host_stats', h.id, (err: Error, reply: string) => {
        if (err) return reject(err);
        resolve(reply);
      });
    });
  }

  insertRegionData(r: IRegion, data: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let args: any[] = ['region_stats', r.uuid, data];
      this.redis.hset(args, (err: Error, reply) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  getRegionData(r: IRegion): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.redis.hget('region_stats', r.uuid, (err: Error, reply: string) => {
        if (err) return reject(err);
        resolve(reply);
      });
    });
  }

  isRegionRunning(r: IRegion): Promise<boolean> {
    return this.getRegionData(r).then((data: string) => {
      if (!data) return false;
      let d = JSON.parse(data);
      return d.isRunning;
    });
  }

}