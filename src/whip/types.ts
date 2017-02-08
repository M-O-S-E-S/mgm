
export enum RequestCodes {
  AuthChallenge = 0,
  AuthResponse = 1,
  Get = 10,
  Put = 11,
  Purge = 12,
  Test = 13,
  GetAllIDs = 16
}

export enum ServerResponseCodes {
  Found = 10,
  NotFound = 11,
  Error = 12,
  OK = 13
}

export const HEADERSIZE: number = 37;
