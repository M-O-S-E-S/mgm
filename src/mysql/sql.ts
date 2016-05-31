
/// <reference path="../../typings/index.d.ts" />

import * as Promise from 'bluebird';
import * as mysql from 'mysql';

export class Sql {
  public pool: mysql.IPool

  constructor(config) {
    this.pool = mysql.createPool({
      host: config.db_host,
      user: config.db_user,
      password: config.db_pass,
      database: config.db_name
    });
  }
}
