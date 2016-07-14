import * as mysql from 'mysql';

import { messages } from './messages';
import { jobs } from './jobs';
import { regions } from './regions';
import { hosts } from './hosts';

interface DBConfig {
  db_host: string
  db_user: string
  db_pass: string
  db_name: string
}

export class MGMDB {
  private static _instance: MGMDB = null;

  public messages: messages
  public jobs: jobs
  public regions: regions
  public hosts: hosts

  constructor(conf: DBConfig){
    if(MGMDB._instance){
      throw new Error('MGMDB singleton has already been initialized');
    }
    let pool = mysql.createPool({
      host: conf.db_host,
      user: conf.db_user,
      password: conf.db_pass,
      database: conf.db_name
    });

    this.messages = new messages(pool);
    this.jobs = new jobs(pool);
    this.regions = new regions(pool);
    this.hosts = new hosts(pool);

    MGMDB._instance = this;
  }

  public static instance():MGMDB {
    return MGMDB._instance;
  }

}
