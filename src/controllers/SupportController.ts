// eslint-disable-next-line no-unused-vars
import express from 'express';
import moment from 'moment';
import { User } from '../database/models/User';
import Response from '../helpers/Response';
import codes from '../helpers/statusCodes';
import { mongoose } from '../database/mongoose';
import MSupportRequest, { SupportRequest } from '../database/models/SupportRequest';
import { PDF, CSV } from '../helpers/exporter';

/**
* Support Controller
*/
class SupportRequestController {
  /**
  * This handles creating a new support request.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async create(req: express.Request & { user: User }, res: express.Response) {
    const {
      subject, message,
    } = req.body;

    const { user } = req;

    try {
      let support = await MSupportRequest.create(<SupportRequest>{
        subject, message, user: user._id,
      });

      return Response.send(res, codes.created, {
        data: support,
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }

  /**
  * This handles getting all support requests.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async getAll(req: express.Request & { user: User }, res: express.Response) {
    const { user } = req;

    try {
      const filter: SupportRequest = <SupportRequest>{};
      if (user.role === 'user') filter.user = user._id;

      const sRequests = await MSupportRequest.find(filter);

      return Response.send(res, codes.success, {
        data: sRequests,
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }

  /**
  * This handles getting support request by id.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async getOne(req: express.Request & { user: User }, res: express.Response) {
    const { id } = req.params;
    const { user } = req;

    try {
      const sRequest = mongoose.Types.ObjectId.isValid(id) && await MSupportRequest.findById(id);

      const canView = user.role !== 'user' ? true : sRequest && sRequest.user.toString() == user._id.toString();
      if (!sRequest || !canView) {
        return Response.send(res, codes.notFound, { error: 'Support item not found' })
      }

      return Response.send(res, codes.success, {
        data: sRequest,
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }

  /**
  * This handles commenting on a support request.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async comment(req: express.Request & { user: User }, res: express.Response) {
    const { id } = req.params;
    const { message } = req.body;
    const { user } = req;

    try {
      const sRequest = mongoose.Types.ObjectId.isValid(id) && await MSupportRequest.findById(id);

      const canView = user.role !== 'user' ? true : sRequest && sRequest.user.toString() == user._id.toString();
      if (!sRequest || !canView) {
        return Response.send(res, codes.notFound, { error: 'Support item not found' })
      }

      const canComment = sRequest.status === 'processing' || user.role !== 'user';
      if (!canComment) {
        return Response.send(res, codes.badRequest, { error: 'You are not permitted to add comment' })
      }

      sRequest.comments.push({
        message, user: user._id, createdAt: new Date(),
      });
      if (sRequest.status === 'open') sRequest.status = 'processing';
      await sRequest.save();

      return Response.send(res, codes.success, {
        data: sRequest,
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }

  /**
  * This handles closing support request.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async close(req: express.Request & { user: User }, res: express.Response) {
    const { id } = req.params;

    try {
      const sRequest = mongoose.Types.ObjectId.isValid(id) && await MSupportRequest.findById(id);

      if (!sRequest) {
        return Response.send(res, codes.notFound, { error: 'Support item not found' })
      }
      if (sRequest.status === 'closed') {
        return Response.send(res, codes.badRequest, { error: 'Support item already closed' })
      }
      sRequest.status = 'closed';
      sRequest.closedBy = req.user._id;
      sRequest.closedAt = new Date();
      await sRequest.save();

      return Response.send(res, codes.success, {
        data: sRequest,
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }

  /**
  * This handles deleting support request by id.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async delete(req: express.Request, res: express.Response) {
    const { id } = req.params;

    try {
      const sRequest = mongoose.Types.ObjectId.isValid(id) && await MSupportRequest.findById(id);

      if (!sRequest) {
        return Response.send(res, codes.notFound, { error: 'Support item not found' })
      }
      await sRequest.deleteOne();

      return Response.send(res, codes.success, {
        message: 'Support item deleted successfully.',
      });
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }

  /**
  * This handles exportind support requests.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  static async export(req: express.Request, res: express.Response) {
    const dFormat = 'DD-MM-YYYY';
    const {
      start = moment().subtract(1, 'month').format(dFormat),
      end = moment().format(dFormat),
    } = req.query;
    const status: string = <string>req.query.status || 'closed';
    const type: string = <string>req.query.type || 'csv';

    try {
      const startDate = moment(<string>start, dFormat);
      const endDate = moment(<string>end, dFormat).endOf('d');
      if (!startDate.isValid() || !endDate.isValid()) {
        return Response.send(res, codes.badRequest, { error: `Format for start and end dates must be "${dFormat}"` })
      }

      if (!['open', 'closed'].includes(<string>status)) {
        return Response.send(res, codes.badRequest, { error: 'Status can only be "open" or "closed"' })
      }

      if (!['csv', 'pdf'].includes(<string>type)) {
        return Response.send(res, codes.badRequest, { error: 'Type can only be "pdf" or "csv"' })
      }

      const sRequests = await MSupportRequest.find({
        $and: [{ createdAt: { $gte: startDate.toDate() } }, { createdAt: { $lte: endDate.toDate() } }],
        status: status === 'open' ? { $ne: 'closed' } : 'closed',
      }).populate('user').populate('closedBy');

      if (!sRequests.length) return Response.send(res, codes.notFound, {
        error: 'No support request found.',
      });

      const data = sRequests.map((item, i) => {
        const user = <User>item.user;
        const closedBy = <User>(item.closedBy || {});
        const rec = {
          'S/N': i + 1,
          'Customer Name': `${user.firstName} ${user.lastName}`,
          'Customer Email': user.email,
          'Request Subject': item.subject,
          'Request Status': item.status,
          'Comment Count': item.comments.length,
          'Logged On': moment(item.createdAt).format(dFormat + ' HH:mm:ss').toString(),
        }
        if (item.closedBy) {
          rec['Closed By'] = `${closedBy.firstName} ${closedBy.lastName}`;
          rec['Closed On'] = moment(item.closedAt).format(dFormat + ' HH:mm:ss').toString();
        }
        return rec;
      })

      const title = `${status.toUpperCase()} Support Requests from ${startDate.format(dFormat)} to ${endDate.format(dFormat)}`;
      const filename = `${status}-support-request-${<string>start}-${<string>end}.${type}`;
      const mimetype = {
        csv: 'text/csv',
        pdf: 'application/pdf',
      }
      const bufferData = type === 'csv' ? CSV(data) : await PDF(data, title);
      res.contentType(mimetype[type]);
      res.setHeader('Content-disposition', 'attachment;filename=' + filename);
      res.setHeader('Content-Length', '' + bufferData.length);
      return res.status(200).send(bufferData);
    } catch (error) { return Response.send(res, codes.serverError, error); }
  }
}

export default SupportRequestController;
