/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import bcrypt from 'bcrypt';
import app from '../src/app';
import MUser, { User } from '../src/database/models/User';
import codes from '../src/helpers/statusCodes';
import { aUser, aUser2, aUser3, aUser4 } from './testData';

chai.use(chaiHttp);

let adminAuthorization: string, agentAuthorization: string, userId: string;

describe('Manage users: /users', () => {
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
  });

  after(async () => {
    await MUser.deleteMany({});
  });

  it('should successfully create an agent', async () => {
    const response = await chai.request(app)
      .post('/api/v1/users').set('authorization', adminAuthorization).send({ ...aUser4, role: 'agent' });

    expect(response.status).to.eqls(codes.created);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.created);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.firstName).to.be.a('string');
    expect(response.body.data.lastName).to.be.a('string');
    expect(response.body.data.email).to.be.a('string');
    expect(response.body.data.role).to.eqls('agent');
  });

  it('should successfully create a user', async () => {
    const response = await chai.request(app)
      .post('/api/v1/users').set('authorization', adminAuthorization).send({ ...aUser3, role: 'user' });

    expect(response.status).to.eqls(codes.created);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.created);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.firstName).to.be.a('string');
    expect(response.body.data.lastName).to.be.a('string');
    expect(response.body.data.email).to.be.a('string');
    expect(response.body.data.role).to.eqls('user');
    userId = response.body.data._id;
  });

  it('agent should fail to create a user - not permitted', async () => {
    const response = await chai.request(app)
      .post('/api/v1/users').set('authorization', agentAuthorization).send({ ...aUser3, role: 'user' });

    expect(response.status).to.eqls(codes.forbidden);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.forbidden);
    expect(response.body.error).to.eqls('You are not permitted to access this resource.');
  });

  it('should successfully get users', async () => {
    const response = await chai.request(app)
      .get('/api/v1/users').set('authorization', adminAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('array');
    expect(response.body.data.length).to.be.eqls(4);
    expect(response.body.data[0].firstName).to.be.a('string');
    expect(response.body.data[0].lastName).to.be.a('string');
    expect(response.body.data[0].email).to.be.a('string');
    expect(response.body.data[0].role).to.be.a('string');
  });

  it('should successfully get a user by ID', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/users/${userId}`).set('authorization', adminAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data).to.be.an('object');
    expect(response.body.data.firstName).to.be.a('string');
    expect(response.body.data.lastName).to.be.a('string');
    expect(response.body.data.email).to.be.a('string');
    expect(response.body.data.role).to.be.a('string');
  });

  it('should successfully delete a user by ID', async () => {
    const response = await chai.request(app)
      .delete(`/api/v1/users/${userId}`).set('authorization', adminAuthorization);

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.message).to.eqls('User deleted successfully.');
  });

  it('should fail to get a user by ID that does not exist', async () => {
    const response = await chai.request(app)
      .get(`/api/v1/users/${userId}`).set('authorization', adminAuthorization);

    expect(response.status).to.eqls(codes.notFound);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.notFound);
    expect(response.body.error).to.eqls('User not found');
  });

  it('should fail to delete a user by ID that does not exist', async () => {
    const response = await chai.request(app)
      .delete(`/api/v1/users/${userId}`).set('authorization', adminAuthorization);

    expect(response.status).to.eqls(codes.notFound);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.notFound);
    expect(response.body.error).to.eqls('User not found');
  });

  it('agent should fail to delete a user - not permitted', async () => {
    const response = await chai.request(app)
      .delete(`/api/v1/users/${userId}`).set('authorization', agentAuthorization);

    expect(response.status).to.eqls(codes.forbidden);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.forbidden);
    expect(response.body.error).to.eqls('You are not permitted to access this resource.');
  });
});
