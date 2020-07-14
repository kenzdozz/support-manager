// eslint-disable-next-line no-unused-vars
import express from 'express';
import bcrypt from 'bcrypt';
import MUser from '../database/models/User';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import TokenUtil from '../helpers/TokenUtil';

/**
* Authentication Controller
*/
class AuthController {
  /**
  * This handles user registration.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async signup(req: express.Request, res: express.Response) {
    const {
      lastName, firstName, email, password: pass,
    } = req.body;

    try {
      const password = bcrypt.hashSync(pass, 10);
      let user = new MUser({ lastName, firstName, email, password });
      user.save();

      user = user.toObject();
      delete user.password;
      
      /** Creates a token to log the user in */
      const token = TokenUtil.sign(user);
      res.cookie('Authorization', token, { maxAge: 900000, httpOnly: true });

      return Response.send(res, codes.created, {
        data: { token, user },
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }

  /**
  * This handles user login.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async login(req: express.Request, res: express.Response) {
    const { email, password } = req.body;

    try {
      let user = await MUser.findOne({ email });

      if (!user || !await bcrypt.compareSync(password, user.password)) {
        return Response.send(res, codes.unAuthorized, {
          error: 'Invalid email address or password.',
        });
      }

      user = user.toObject();
      delete user.password;

      const token = TokenUtil.sign(user);
      res.cookie('Authorization', token, { maxAge: 900000, httpOnly: true });

      return Response.send(res, codes.success, {
        data: { token, user },
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }
}

export default AuthController;
