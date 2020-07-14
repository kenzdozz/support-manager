import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/app';
import MUser from '../src/database/models/User';
import codes from '../src/helpers/statusCodes';
import { aUser } from './testData';
import TokenUtil from '../src/helpers/TokenUtil';

chai.use(chaiHttp);

describe('Sign up a user: POST /auth/signup', () => {
  it('should successfully signup a new user', async () => {
    const response = await chai.request(app).post('/api/v1/auth/signup').send(aUser);

    expect(response.status).to.eqls(codes.created);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.created);
    expect(response.body.data.token).to.be.a('string');
    expect(response.body.data.user).to.be.an('object');
    expect(response.body.data.user.firstName).to.eqls(aUser.firstName);
    expect(response.body.data.user.lastName).to.eqls(aUser.lastName);
    expect(response.body.data.user.email).to.eqls(aUser.email);
  });

  it('should fail to create a user without a name', async () => {
    const aUser2 = { ...aUser, email: 'ken@ken.com' };
    delete aUser2.firstName;
    const response = await chai.request(app).post('/api/v1/auth/signup').send(aUser2);

    expect(response.status).to.eqls(codes.badRequest);
    expect(response.body.status).to.eqls(codes.badRequest);
    expect(response.body.error).eqls('Validation errors.');
    expect(response.body.fields.firstName).eqls('FirstName is required.');
  });
});

describe('Login a user: POST /auth/login', () => {
  after(async () => {
    await MUser.deleteMany({});
  });

  it('should successfully login a user', async () => {
    const response = await chai.request(app)
      .post('/api/v1/auth/login').send({
        email: aUser.email,
        password: aUser.password,
      });

    expect(response.status).to.eqls(codes.success);
    expect(response.body).to.be.an('object');
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.data.token).to.be.a('string');
    expect(response.body.data.user).to.be.an('object');
    expect(response.body.data.user.firstName).to.eqls(aUser.firstName);
    expect(response.body.data.user.lastName).to.eqls(aUser.lastName);
    expect(response.body.data.user.email).to.eqls(aUser.email);
  });

  it('should fail to login a user with incorrect email', async () => {
    const response = await chai.request(app)
      .post('/api/v1/auth/login').send({
        email: 'random@email.com',
        password: aUser.password,
      });

    expect(response.status).to.eqls(codes.unAuthorized);
    expect(response.body.status).to.eqls(codes.unAuthorized);
    expect(response.body.error).eqls('Invalid email address or password.');
  });

  it('should fail to login a user with incorrect password', async () => {
    const response = await chai.request(app)
      .post('/api/v1/auth/login').send({
        email: aUser.email,
        password: 'Userpassword',
      });

    expect(response.status).to.eqls(codes.unAuthorized);
    expect(response.body.status).to.eqls(codes.unAuthorized);
    expect(response.body.error).eqls('Invalid email address or password.');
  });
});

describe('Test authenication', () => {
  it('should fail to access secured endpoint without token', async () => {
    const response = await chai.request(app)
      .get('/api/v1/supports');

    expect(response.status).to.eqls(codes.unAuthorized);
    expect(response.body.status).to.eqls(codes.unAuthorized);
    expect(response.body.error).eqls('Authorization is required.');
  });

  const token = TokenUtil.sign({ _id: '5f0b219d6a85e566be4e4081' });
  it('should fail to access secured endpoint without invalid token', async () => {
    const response = await chai.request(app)
      .get('/api/v1/supports').set('authorization', `Bearer ${token}`);

    expect(response.status).to.eqls(codes.unAuthorized);
    expect(response.body.status).to.eqls(codes.unAuthorized);
    expect(response.body.error).eqls('Provided authorization is invalid or has expired.');
  });
});

describe('Test other routes', () => {
  it('should test that app is running', async () => {
    const response = await chai.request(app)
      .get('/');

    expect(response.status).to.eqls(codes.success);
    expect(response.body.status).to.eqls(codes.success);
    expect(response.body.message).eqls('This app is running.');
  });

  it('should get 404 for non existent pages', async () => {
    const response = await chai.request(app)
      .get('/api/v1');

    expect(response.status).to.eqls(codes.notFound);
    expect(response.body.status).to.eqls(codes.notFound);
    expect(response.body.error).eqls('Endpoint not found.');
  });
});
