import MUser from '../database/models/User';

const registerRules = {
  firstName: 'required',
  lastName: 'required',
  email: {
    rules: 'required|email|unique',
    unique: {
      async exists(email) {
        const e = await MUser.findOne({ email });
        return !!e;
      },
    },
  },
  password: {
    rules: 'required|minlen',
    minlen: 8,
  },
};

const createUserRules = {
  firstName: 'required',
  lastName: 'required',
  email: {
    rules: 'required|email|unique',
    unique: {
      async exists(email) {
        const e = await MUser.findOne({ email });
        return !!e;
      },
    },
  },
  password: {
    rules: 'required|minlen',
    minlen: 8,
  },
  role: {
    rules: 'required|belongsto',
    belongsto: ['admin', 'agent', 'user'],
  }
};

const loginRules = {
  email: 'required|email',
  password: 'required',
};

const supportRules = {
  subject: 'required',
  message: 'required',
};

export {
  registerRules, loginRules, createUserRules, supportRules,
};
