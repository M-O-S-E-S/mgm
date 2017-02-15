import * as express from 'express';
import { UserDetail } from '../Auth';
import { Set } from 'immutable';

export interface NetworkResponse {
    Success: boolean
    Message ?: string
}

export interface AuthenticatedRequest extends express.Request {
  user: UserDetail
  body?: any
  params: any
}