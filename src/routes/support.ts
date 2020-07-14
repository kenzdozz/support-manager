import express from 'express';
import SupportController from '../controllers/SupportController';
import authenticated from '../middlewares/authentication';
import validateInputs from 'json-request-validator';
import { supportRules } from '../middlewares/validationRules';
import isPermitted from '../middlewares/isPermitted';

/**
 * Routes of '/votes'
 */
const supportRouter = express.Router();

supportRouter.use(authenticated);

supportRouter.route('/')
    .get(SupportController.getAll)
    .post(validateInputs(supportRules), SupportController.create);

supportRouter.route('/export')
    .get(SupportController.export);

supportRouter.route('/:id([0-9a-fA-F]{24})')
    .get(SupportController.getOne)
    .post(validateInputs({ message: 'required' }), SupportController.comment)
    .patch(isPermitted('support'), SupportController.close)
    .delete(isPermitted('support'), SupportController.delete);

export default supportRouter;
