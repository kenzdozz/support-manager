import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import app from '../src/app';
import codes from '../src/helpers/statusCodes';
import MUser, { User } from '../src/database/models/User';
import MSupportRequest from '../src/database/models/SupportRequest';
import { aUser, aUser3, aUser4, aSupport, aSupport2, aUser2 } from './testData';

chai.use(chaiHttp);

let adminAuthorization: string, 
  agentAuthorization: string,
  userAuthorization: string,
  user2Authorization: string,
  supportId: string,
  supportId2: string;

describe('Support requests: /supports', () => {
  before(async () => {
    /** Create and login admin */
    const password = bcrypt.hashSync(aUser.password, 10);
    await MUser.create(<User>{ ...aUser, password, role: 'admin' });
    const loginResponse = await chai.request(app)
      .post('/api/v1/auth/login').send({
        email: aUser.email,
        password: aUser.password,
      });
    adminAuthorization = `Bearer ${loginResponse.body.data.token}`;

    /** Create and login agent */
    const password1 = bcrypt.hashSync(aUser2.password, 10);
    await MUser.create(<User>{ ...aUser2, password: password1, role: 'agent' });
    const login1Response = await chai.request(app)
      .post('/api/v1/auth/login').send({
        email: aUser2.email,
        password: aUser2.password,
      });
    agentAuthorization = `Bearer ${login1Response.body.data.token}`;

    /** Create and login user */
    const password2 = bcrypt.hashSync(aUser3.password, 10);
    await MUser.create(<User>{ ...aUser3, password: password2, role: 'user' });
    const login2Response = await chai.request(app)
      .post('/api/v1/auth/login').send({
        email: aUser3.email,
        password: aUser3.password,
      });
    userAuthorization = `Bearer ${login2Response.body.data.token}`;

    /** Create and login user2 */
    const password3 = bcrypt.hashSync(aUser4.password, 10);
    await MUser.create(<User>{ ...aUser4, password: password3, role: 'user' });
    const login3Response = await chai.request(app)
      .post('/api/v1/auth/login').send({
        email: aUser4.email,
        password: aUser4.password,
      });
    user2Authorization = `Bearer ${login3Response.body.data.token}`;
  });

  after(async () => {
    await MUser.deleteMany({});
    await MSupportRequest.deleteMany({});
  });

  it('user should successfully create a support request', async () => {
    const response = await chai.request(app)
      .post('/api/v1/supports').set('authorization', userAuthorization).send(aSupport);

    expect(response.status).to.eqls(codes.created);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.created);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.subject).to.eqls(aSupport.subject);
    expect(response.body.data.message).to.eqls(aSupport.message);
    expect(response.body.data.status).to.eqls('open');
    expect(response.body.data.user).to.be.a('string');
    expect(response.body.data.comments).to.be.an('array');
    supportId = response.body.data._id;
  });

  it('user2 should successfully create a support request', async () => {
    const response = await chai.request(app)
      .post('/api/v1/supports').set('authorization', user2Authorization).send(aSupport2);

    expect(response.status).to.eqls(codes.created);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.created);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.subject).to.eqls(aSupport2.subject);
    expect(response.body.data.message).to.eqls(aSupport2.message);
    expect(response.body.data.status).to.eqls('open');
    expect(response.body.data.user).to.be.a('string');
    expect(response.body.data.comments).to.be.an('array');
    supportId2 = response.body.data._id;
  });

  it('user2 should successfully get support requests he/she created', async () => {
    const response = await chai.request(app)
      .get('/api/v1/supports').set('authorization', user2Authorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('array');
    expect(response.body.data.length).to.be.eqls(1);
    expect(response.body.data[0].subject).to.eqls(aSupport2.subject);
    expect(response.body.data[0].message).to.eqls(aSupport2.message);
    expect(response.body.data[0].status).to.eqls('open');
    expect(response.body.data[0].user).to.be.a('string');
    expect(response.body.data[0].comments).to.be.an('array');
  });

  it('admin should successfully get all support requests', async () => {
    const response = await chai.request(app)
      .get('/api/v1/supports').set('authorization', adminAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('array');
    expect(response.body.data.length).to.be.eqls(2);
    expect(response.body.data[0].subject).to.be.a('string');
    expect(response.body.data[0].message).to.be.a('string');
    expect(response.body.data[0].status).to.be.a('string');
    expect(response.body.data[0].user).to.be.a('string');
    expect(response.body.data[0].comments).to.be.an('array');
  });

  it('agent should successfully get all support requests', async () => {
    const response = await chai.request(app)
      .get('/api/v1/supports').set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('array');
    expect(response.body.data.length).to.be.eqls(2);
    expect(response.body.data[0].subject).to.be.a('string');
    expect(response.body.data[0].message).to.be.a('string');
    expect(response.body.data[0].status).to.be.a('string');
    expect(response.body.data[0].user).to.be.a('string');
    expect(response.body.data[0].comments).to.be.an('array');
  });

  it('user should fail to get a support request by ID created by user2', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/supports/${supportId2}`).set('authorization', userAuthorization);

    expect(response.status).to.eqls(codes.notFound);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.notFound);
    expect(response.body.error).to.eqls('Support item not found');
  });

  it('user2 should successfully get a support request by ID created by him/her', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/supports/${supportId2}`).set('authorization', user2Authorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.subject).to.eqls(aSupport2.subject);
    expect(response.body.data.message).to.eqls(aSupport2.message);
    expect(response.body.data.status).to.eqls('open');
    expect(response.body.data.user).to.be.a('string');
    expect(response.body.data.comments).to.be.an('array');
  });

  it('admin should successfully get a support request by ID', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/supports/${supportId2}`).set('authorization', adminAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.subject).to.eqls(aSupport2.subject);
    expect(response.body.data.message).to.eqls(aSupport2.message);
    expect(response.body.data.status).to.eqls('open');
    expect(response.body.data.user).to.be.a('string');
    expect(response.body.data.comments).to.be.an('array');
    expect(response.body.data.comments.length).to.eqls(0);
  });

  it('agent should successfully get a support request by ID', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/supports/${supportId}`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.subject).to.eqls(aSupport.subject);
    expect(response.body.data.message).to.eqls(aSupport.message);
    expect(response.body.data.status).to.eqls('open');
    expect(response.body.data.user).to.be.a('string');
    expect(response.body.data.comments).to.be.an('array');
    expect(response.body.data.comments.length).to.eqls(0);
  });

  it('user2 should fail to comment on a support request before agent comments', async () => {
    const response = await chai.request(app)
      .post(`/api/v1/supports/${supportId2}`).set('authorization', user2Authorization).send({
        message: 'Are you there?',
      });

    expect(response.status).to.eqls(codes.badRequest);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.badRequest);
    expect(response.body.error).to.eqls('You are not permitted to add comment');
  });

  it('agent should comment on a support request', async () => {
    const response = await chai.request(app)
      .post(`/api/v1/supports/${supportId}`).set('authorization', agentAuthorization).send({
        message: 'How often does this happen?',
      });

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.subject).to.eqls(aSupport.subject);
    expect(response.body.data.message).to.eqls(aSupport.message);
    expect(response.body.data.status).to.eqls('processing');
    expect(response.body.data.user).to.be.a('string');
    expect(response.body.data.comments).to.be.an('array');
    expect(response.body.data.comments.length).to.eqls(1);
    expect(response.body.data.comments[0].message).to.eqls('How often does this happen?');
  });

  it('admin should comment on a support request', async () => {
    const response = await chai.request(app)
      .post(`/api/v1/supports/${supportId2}`).set('authorization', adminAuthorization).send({
        message: 'How often does this happen?',
      });

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.subject).to.eqls(aSupport2.subject);
    expect(response.body.data.message).to.eqls(aSupport2.message);
    expect(response.body.data.status).to.eqls('processing');
    expect(response.body.data.user).to.be.a('string');
    expect(response.body.data.comments).to.be.an('array');
    expect(response.body.data.comments.length).to.eqls(1);
    expect(response.body.data.comments[0].message).to.eqls('How often does this happen?');
  });

  it('user2 should successfully comment on a support request', async () => {
    const response = await chai.request(app)
      .post(`/api/v1/supports/${supportId2}`).set('authorization', user2Authorization).send({
        message: 'It happens always',
      });

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.subject).to.eqls(aSupport2.subject);
    expect(response.body.data.message).to.eqls(aSupport2.message);
    expect(response.body.data.status).to.eqls('processing');
    expect(response.body.data.user).to.be.a('string');
    expect(response.body.data.comments).to.be.an('array');
    expect(response.body.data.comments.length).to.eqls(2);
    expect(response.body.data.comments[0].message).to.eqls('How often does this happen?');
    expect(response.body.data.comments[1].message).to.eqls('It happens always');
  });

  it('agent should close a support request', async () => {
    const response = await chai.request(app)
      .patch(`/api/v1/supports/${supportId}`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.subject).to.eqls(aSupport.subject);
    expect(response.body.data.message).to.eqls(aSupport.message);
    expect(response.body.data.status).to.eqls('closed');
    expect(response.body.data.user).to.be.a('string');
    expect(response.body.data.comments).to.be.an('array');
    expect(response.body.data.comments.length).to.eqls(1);
    expect(response.body.data.comments[0].message).to.eqls('How often does this happen?');
  });

  /** Testing Export */
  it('agent should get error closing an already closed support request', async () => {
    const response = await chai.request(app)
      .patch(`/api/v1/supports/${supportId}`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.badRequest);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.badRequest);
    expect(response.body.error).to.eqls('Support item already closed');
  });

  it('agent should get error closing a support request item that does not exist', async () => {
    const response = await chai.request(app)
      .patch(`/api/v1/supports/5f0b1b8a5f40aa4670d5d36a`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.notFound);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.notFound);
    expect(response.body.error).to.eqls('Support item not found');
  });

  it('should export open support as csv', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/supports/export?status=open`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.type).to.eqls('text/csv')
  });

  it('should export closed support as pdf', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/supports/export?type=pdf`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.type).to.eqls('application/pdf')
  });

  it('should fail to export for invalid type', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/supports/export?type=xlsx`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.badRequest);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.badRequest);
    expect(response.body.error).to.eqls('Type can only be "pdf" or "csv"');
  });

  it('should fail to export for invalid status', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/supports/export?status=xlsx`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.badRequest);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.badRequest);
    expect(response.body.error).to.eqls('Status can only be "open" or "closed"');
  });

  it('should fail to export for invalid start date', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/supports/export?start=12-13-2020&end=13-07-2020`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.badRequest);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.badRequest);
    expect(response.body.error).to.eqls('Format for start and end dates must be "DD-MM-YYYY"');
  });

  it('should fail to export when there is no data for selected date range', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/supports/export?start=12-01-2020&end=13-01-2020`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.notFound);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.notFound);
    expect(response.body.error).to.eqls('No support request found.');
  });
  /** Testing Exports Ended */

  it('admin should close a support request', async () => {
    const response = await chai.request(app)
      .patch(`/api/v1/supports/${supportId2}`).set('authorization', adminAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.subject).to.eqls(aSupport2.subject);
    expect(response.body.data.message).to.eqls(aSupport2.message);
    expect(response.body.data.status).to.eqls('closed');
    expect(response.body.data.user).to.be.a('string');
    expect(response.body.data.comments).to.be.an('array');
    expect(response.body.data.comments.length).to.eqls(2);
    expect(response.body.data.comments[0].message).to.eqls('How often does this happen?');
    expect(response.body.data.comments[1].message).to.eqls('It happens always');
  });

  it('admin should successfully delete a support request by ID', async () => {
    const response = await chai.request(app)
      .delete(`/api/v1/supports/${supportId2}`).set('authorization', adminAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.message).to.eqls('Support item deleted successfully.');
  });

  it('admin should fail to delete a support request by ID that does not exist', async () => {
    const response = await chai.request(app)
      .delete(`/api/v1/supports/${supportId2}`).set('authorization', adminAuthorization);

    expect(response.status).to.eqls(codes.notFound);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.notFound);
    expect(response.body.error).to.eqls('Support item not found');
  });

  it('agent should fail to delete a support request by ID - not permitted', async () => {
    const response = await chai.request(app)
      .delete(`/api/v1/supports/${supportId2}`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.forbidden);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.forbidden);
    expect(response.body.error).to.eqls('You are not permitted to access this resource.');
  });
});
