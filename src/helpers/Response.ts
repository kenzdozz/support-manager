import express from 'express';
import codes from './statusCodes';
import Logger from './Logger';

class Response {
  static send(res: express.Response, status: number, data: object) {
    if (status === codes.serverError) {
      Logger.log(data);
      data = { error: 'Internal server error' }
    }
    return res.status(status).send({
      status,
      ...data,
    });
  }
}

export default Response;
