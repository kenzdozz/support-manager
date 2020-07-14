import express from 'express';
import UserController from '../controllers/UserController';
import authenticated from '../middlewares/authentication';
import validateInputs from 'json-request-validator';
import { createUserRules } from '../middlewares/validationRules';
import isPermitted from '../middlewares/isPermitted';

/**
 * Routes of '/votes'
 */
const userRouter = express.Router();

userRouter.use(authenticated);

userRouter.route('/')
    .get(isPermitted('users'), UserController.getAll)
    .post(isPermitted('users'), validateInputs(createUserRules), UserController.create);

userRouter.route('/:id([0-9a-fA-F]{24})')
    .get(UserController.getOne)
    .delete(isPermitted('users'), UserController.delete);

export default userRouter;
