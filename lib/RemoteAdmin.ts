import * as xmlrpc from 'xmlrpc';
import { IRegion } from './types';
import Promise = require('bluebird');

export class RemoteAdmin {
  private sessionID: string
  public connected: boolean
  private client
  
  constructor(region: IRegion) {
    this.client = xmlrpc.createClient({ host: region.node, port: region.port, path: '/xmlrpc/RemoteAdmin/' });
    this.connected = false;
  } 
  
  login(token: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.methodCall('session.login_with_token', [token], (err: Error, result) => {
        if (err) return reject(err);
        if (result.Status !== 'Success') return reject(new Error(result.ErrorDescription));
        this.sessionID = result.Value;
        this.connected = true;
        resolve();
      });
    });
  } 
  
  shutdown(region: IRegion): Promise<void> {
    if (!this.connected) return Promise.reject(new Error('RemoteAdmin is not connected'));
    return new Promise<void>((resolve, reject) => {
      this.client.methodCall('Region.Shutdown', [this.sessionID, region.uuid, 0], (err: Error, result) => {
        if (err) return reject(err);
        if (result.Status !== 'Success') return reject(new Error(result.ErrorDescription));
        resolve();
      });
    });
  } 
  
  saveOar(region: IRegion): Promise<void> {
    if (!this.connected) return Promise.reject(new Error('RemoteAdmin is not connected'));
    return new Promise<void>((resolve, reject) => {
      this.client.methodCall('Region.Backup', [this.sessionID, region.name, region.name + '.oar', true], (err: Error, result) => {
        if (err) return reject(err);
        if (result.Status !== 'Success') return reject(new Error(result.ErrorDescription));
        resolve();
      });
    })
  } 
  
  loadOar(region: IRegion): Promise<void> {
    if (!this.connected) return Promise.reject(new Error('RemoteAdmin is not connected'));
    return new Promise<void>((resolve, reject) => {
      this.client.methodCall('Region.Restore', [this.sessionID, region.name, region.name + '.oar', true, true], (err: Error, result) => {
        if (err) return reject(err);
        if (result.Status !== 'Success') return reject(new Error(result.ErrorDescription));
        resolve();
      });
    })
  } 
  
  logout(): Promise<void> {
    if (!this.connected) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      this.client.methodCall('session.logout', [this.sessionID], (err: Error) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
