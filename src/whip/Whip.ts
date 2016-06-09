/// <reference path="../../typings/index.d.ts" />

import * as Promise from 'bluebird';
import { Socket } from 'net';
import { RequestCodes, ServerResponseCodes } from './types';
import { UUIDString } from '../halcyon/UUID';
import { AuthChallenge, AuthResponse, AuthConfirmation } from './auth';
import { ClientRequest } from './request';
import { ServerResponse } from './serverResponse';
import { Asset } from './asset';

class request {
  resolve: (any) => void
  reject: (Error) => void
  id: UUIDString

  constructor(id: UUIDString, resolve, reject) {
    this.id = id;
    this.resolve = resolve;
    this.reject = reject;
  }
}

export class WhipServer {
  private address: string
  private port: number
  private password: string
  private link: Socket
  private connected: boolean
  private messageBuffer: Buffer
  private requestQueue: request[]

  private chunkBuffer: Buffer

  constructor(url: string) {
    let parts = url.match('^whip:\/\/(.{1,}?)@(.{7,}?):([0-9]{4,}\w?)');
    if (!parts) {
      throw new Error('Invalid whip configuration: ' + url + ', should be of the form whip://<password>@<address>:<port>');
    }
    this.password = parts[1];
    this.address = parts[2];
    this.port = Number(parts[3]);
    this.requestQueue = [];
    this.chunkBuffer = new Buffer([]);
  }

  connect(): Promise<void> {
    if(this.link)
      return Promise.resolve();
    return new Promise<void>((resolve) => {
      this.link = new Socket();
      this.link.connect(this.port, this.address, () => {
        this.link.on('error', (err: Error) => {
          this.link.end();
          throw new Error('An error occurred: ' + err.message);
        });

        //this.link.on('close', () => {
        //  console.log('whip connector: link closed');
        //});
        //this.link.on('finish', () => {
        //});
        this.messageBuffer = new Buffer([]);

        //read once for auth challenge
        this.link.once('readable', () => {
          let chunk: Buffer = this.link.read()
          if (!chunk) return;

          let ch = new AuthChallenge(chunk);
          let r = new AuthResponse(this.password, ch);

          this.link.write(r.response);

          // read once for auth response
          this.link.once('readable', () => {
            let chunk: Buffer = this.link.read()
            if (!chunk) return;
            let resp = new AuthConfirmation(chunk);

            if (resp.success){
              this.link.on('readable', () => this.dataChunker(this.link.read()));
              resolve(null);
            }
            else
              throw new Error('Auth failed to whip server')
          });
        });
      })
    });
  }

  private dataChunker(chunk: Buffer) {
    if (chunk == null)
      return;

    this.chunkBuffer = Buffer.concat([this.chunkBuffer, chunk]);

    try {
      let req = new ServerResponse(this.chunkBuffer);
      this.chunkBuffer = this.chunkBuffer.slice(req.byteLength);
      this.handlePacket(req);
    } catch(err) {
      //pass
    }

  }

  private handlePacket(resp: ServerResponse) {
    let req = this.requestQueue.shift();
    switch (resp.code) {
      case ServerResponseCodes.Found:
        return req.resolve(resp.data);
      case ServerResponseCodes.NotFound:
        return req.reject(new Error('asset not found'));
      case ServerResponseCodes.Error:
        return req.resolve(resp.data.toString());
      case ServerResponseCodes.OK:
        return req.resolve(resp.data);
      default:
        console.log('unknown response code: ' + resp.code);
        return req.reject(new Error('unknown response'));
    }
  }

  disconnect() {
    if (this.link) {
      this.link.end();
    }
  }

  putAsset(asset: Asset): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let req = new ClientRequest(RequestCodes.Put, asset.uuid, asset.serialize());
      this.requestQueue.push(new request(asset.uuid, resolve, reject));
      this.link.write(req.buf);
    });
  }

  getAsset(id: UUIDString): Promise<Asset> {
    return new Promise<Buffer>((resolve, reject) => {
      let req = new ClientRequest(RequestCodes.Get, id);
      this.requestQueue.push(new request(id, resolve, reject));
      this.link.write(req.buf);
    }).then( (buf: Buffer) => {
      return Asset.fromBuffer(buf);
    });
  }

  purgeAsset(id: UUIDString): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let req = new ClientRequest(RequestCodes.Purge, id);
      this.requestQueue.push(new request(id, resolve, reject));
      this.link.write(req.buf);
    });
  }

  testAsset(id: UUIDString): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let req = new ClientRequest(RequestCodes.Test, id);
      this.requestQueue.push(new request(id, resolve, reject));
      this.link.write(req.buf);
    });
  }

  getAllAssetIDs(): Promise<UUIDString[]> {
    return new Promise<Buffer>((resolve, reject) => {
      let req = new ClientRequest(RequestCodes.GetAllIDs);
      this.requestQueue.push(new request(req.id, resolve, reject));
      this.link.write(req.buf);
    }).then((dump: Buffer) => {
      if(!dump)
        throw new Error('Received null buffer instead of list of all IDS');
      console.log(dump.toString());
      let results: UUIDString[] = []
      for(var id of dump.toString().split(',')){
        if(id && id.length == 32){
          results.push(new UUIDString(id));
        }
      }
      return results;
    });
  }
}
