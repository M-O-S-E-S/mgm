
import fs = require('fs');
import * as path from "path";
import { Subject, Observable } from 'rx';

import { UUIDString } from '../../halcyon/UUID';

export class RegionLogs {
  private static _instance: RegionLogs = null;

  private dir: string = '';
  private subjects: {[key:string]: Subject<string>}

  constructor(logDir: string){
    if(RegionLogs._instance){
      throw new Error('RegionLogs singleton has already been initialized');
    }

    //ensure the directory for logs exists
    if (!fs.existsSync(logDir)) {
      fs.mkdir(path.join(logDir), (err) => {
        if (err && err.code !== "EEXIST")
          throw new Error('Cannot create region log directory at ' + logDir);
      });
    }
    this.dir = logDir;
    this.subjects = {};
    RegionLogs._instance = this;
  }

  public static instance():RegionLogs {
    return RegionLogs._instance;
  }

  append(region: UUIDString, lines: string[]): Promise<void> {
    return new Promise<void>( (resolve, reject) => {
      if(region.toString() in this.subjects){
        for(let line of lines){
          this.subjects[region.toString()].onNext(line);
        }
      }else {
        this.subjects[region.toString()] = new Subject<string>();
        //dont send log lines, if it didn't exist nobody can be subscribed
      }
      fs.appendFile(path.join(this.dir, region.getShort()), lines.join('\n'), (err) => {
        if(err) return reject(err);
        resolve();
      });
    });
  }

  getFilePath(region: UUIDString): string {
    return path.join(this.dir, region.getShort());
  }

  source(region: UUIDString): Subject<string> {
    if(region.toString() in this.subjects){
      return this.subjects[region.toString()];
    } else {
      this.subjects[region.toString()] = new Subject<string>();
      return this.subjects[region.toString()];
    }
  }

}
