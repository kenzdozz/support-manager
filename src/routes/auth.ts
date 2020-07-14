import express from 'express';
import validateInputs from 'json-request-validator';
import AuthController from '../controllers/AuthController';
import { registerRules, loginRules } from '../middlewares/validationRules';

/**
 * Routes of '/auth'
 */
const authRouter = express.Router();

authRouter.route('/signup').post(validateInputs(registerRules), AuthController.signup);
authRouter.route('/login').post(validateInputs(loginRules), AuthController.login);

export default authRouter;
