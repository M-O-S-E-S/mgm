
import fs = require('fs');
import * as path from "path";
import Promise = require('bluebird');

import { IRegion } from './types';

export class RegionLogs {
  private dir: string = '';

  constructor(logDir: string) {
    //ensure the directory for logs exists
    if (!fs.existsSync(logDir)) {
      fs.mkdir(path.join(logDir), (err) => {
        if (err && err.code !== "EEXIST")
          throw new Error('Cannot create region log directory at ' + logDir);
      });
    }
    this.dir = logDir;
  }



  append(region: IRegion, lines: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.appendFile(path.join(this.dir, region.uuid), lines.join(''), (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  getLogs(region: IRegion): Promise<string> {
    let filepath = path.join(this.dir, region.uuid);
    return new Promise<string>((resolve, reject) => {
      fs.exists(filepath, (exists: boolean) => {
        if (exists) {
          fs.readFile(filepath, (err: Error, data: Buffer) => {
            if (err) {
              reject(err);
            } else {
              resolve(data.toString());
            }
          });
        } else {
          reject(new Error('No logs found'));
        }
      })
    })
  }

  read(region: IRegion, offset: number): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      var lineReader = require('readline').createInterface({
        input: fs.createReadStream(path.join(this.dir, region.uuid))
      });

      let lineCount = 0;
      let lines: string[] = [];

      lineReader.on('line', (line) => {
        lineCount++;
        if (lineCount >= offset) {
          lines.push(line);
        }
      });

      lineReader.on('close', () => {
        resolve(lines);
      });
    });
  }

}
