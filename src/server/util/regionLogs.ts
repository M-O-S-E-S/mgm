
import fs = require('fs');
import * as path from "path";

import { UUIDString } from '../util/UUID';

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

  append(region: UUIDString, lines: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.appendFile(path.join(this.dir, region.getShort()), lines.join(''), (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  getFilePath(region: UUIDString): string {
    return path.join(this.dir, region.getShort());
  }

  read(region: UUIDString, offset: number): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(path.join(this.dir, region.getShort()))
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
