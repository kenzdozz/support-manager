const validateMongoID = (str) => `${str}`.match(/^[0-9a-fA-F]{24}$/);

// eslint-disable-next-line import/prefer-default-export
export { validateMongoID };
