import { RequestHandler } from 'express';
import { Store } from '../Store';
import { IJob } from '../Types';
import { AuthenticatedRequest } from './Authorizer';

import { Response, GetJobsResponse } from '../View/ClientStack';

export function GetJobsHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    store.Jobs.getFor(req.user.uuid).then((jobs: IJob[]) => {
      res.json(<GetJobsResponse>{
        Success: true,
        Jobs: jobs
      });
    }).catch((err: Error) => {
      res.json({
        Success: false,
        Message: err.message
      });
    });
  };
}