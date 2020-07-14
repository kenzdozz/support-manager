import express from 'express';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import TokenUtil from '../helpers/TokenUtil';
import MUser, { User } from '../database/models/User';

/**
 * Checks if user is authenticated
 * @param {Request} req
 * @param {Response} res
 * @param {*} next
 */
const authenticated = async (req: express.Request & { user: User }, res: express.Response, next: express.NextFunction) => {
  try {
    let token = req.headers.authorization || req.cookies.authorization;

    if (!token) {
      return Response.send(res, codes.unAuthorized, {
        error: 'Authorization is required.',
      });
    }

    token = token.split(' ')[1];
    const data = TokenUtil.verify(token);
    const user = data._id && await MUser.findById(data._id);
    if (!user) {
      return Response.send(res, codes.unAuthorized, {
        error: 'Provided authorization is invalid or has expired.',
      });
    }

    req.user = user;
    return next();
  } catch (error) { return Response.send(res, codes.serverError, error); }
};

export default authenticated;
