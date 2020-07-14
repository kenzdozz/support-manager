import express from 'express';
import swaggerUi from 'swagger-ui-express';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import authRouter from './auth';
import userRouter from './users';
import supportRouter from './support';
import swaggerDoc from '../swagger.json';

const routes = express.Router();

routes.use('/api/v1/auth', authRouter);
routes.use('/api/v1/users', userRouter);
routes.use('/api/v1/supports', supportRouter);
routes.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, false, { docExpansion: 'none' }));

routes.get('/', (req, res) => Response.send(res, codes.success, {
  message: 'This app is running.',
}));

routes.get('*', (req, res) => Response.send(res, codes.notFound, {
  error: 'Endpoint not found.',
}));

export default routes;
