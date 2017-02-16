import { RequestHandler } from 'express';
import { IJob, Store } from '../Store';
import { AuthenticatedRequest } from './Authorizer';

import { Response, GetJobsResponse } from './ClientStack';

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