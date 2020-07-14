// eslint-disable-next-line no-unused-vars
import express from 'express';
import bcrypt from 'bcrypt';
import MUser, { User } from '../database/models/User';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import { mongoose } from '../database/mongoose';

/**
* User Controller
*/
class UserController {
  /**
  * This handles user registration.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async create(req: express.Request, res: express.Response) {
    const {
      lastName, firstName, email, password: pass, role,
    } = req.body;

    try {
      const password = bcrypt.hashSync(pass, 10);
      let user = await MUser.create(<User>{ lastName, firstName, email, password, role });

      user = user.toObject();
      delete user.password;

      return Response.send(res, codes.created, {
        data: user,
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }

  /**
  * This handles getting all users.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async getAll(req: express.Request, res: express.Response) {
    try {
      const users = await MUser.find().select('-password');

      return Response.send(res, codes.success, {
        data: users,
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }

  /**
  * This handles getting user by id.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async getOne(req: express.Request, res: express.Response) {
    const { id } = req.params;

    try {
      const user = mongoose.Types.ObjectId.isValid(id) && await MUser.findById(id).select('-password');

      if (!user) {
        return Response.send(res, codes.notFound, { error: 'User not found' })
      }

      return Response.send(res, codes.success, {
        data: user,
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }

  /**
  * This handles getting user by id.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async delete(req: express.Request, res: express.Response) {
    const { id } = req.params;

    try {
      const user = mongoose.Types.ObjectId.isValid(id) && await MUser.findById(id).select('-password');

      if (!user) {
        return Response.send(res, codes.notFound, { error: 'User not found' })
      }
      await user.deleteOne();

      return Response.send(res, codes.success, {
        message: 'User deleted successfully.',
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }
}

export default UserController;
