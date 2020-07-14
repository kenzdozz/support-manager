import express from 'express';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import { User } from '../database/models/User';

/**
 * Checks if user can write a given resource
 * @param {Request} req
 * @param {Response} res
 * @param {*} next
 */
const isPermitted = (resource: string) => (req: express.Request & { user: User }, res: express.Response, next: express.NextFunction) => {
  try {
    const permissions = {
      'users:get': ['admin', 'agent'],
      'users:post': ['admin'],
      'users:delete': ['admin'],
      'support:delete': ['admin'],
      'support:patch': ['admin', 'agent'],
    }
    const { user, method } = req;
    const perm = `${resource}:${method.toLowerCase()}`;

    if (!permissions[perm].includes(user.role)) {
      return Response.send(res, codes.forbidden, {
        error: 'You are not permitted to access this resource.',
      });
    }

    return next();
  } catch (error) { return Response.send(res, codes.serverError, error); }
};

export default isPermitted;
