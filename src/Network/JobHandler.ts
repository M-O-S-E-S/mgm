import { Response, RequestHandler } from 'express';
import { Job, Store } from '../Store';
import { NetworkResponse, AuthenticatedRequest } from './messages';


export function GetJobsHandler(store: Store): RequestHandler {
  return function(req: AuthenticatedRequest, res) {
    let outUsers: any[] = [];
    let outPUsers: any[] = [];
    store.Jobs.getFor(req.user.uuid).then( (jobs: Job[]) => {

    }).catch( (err: Error) => {

    });
  };
}