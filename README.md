# support-manager-api

[![Build Status](https://travis-ci.org/kenzdozz/support-manager-api.svg?branch=master)](https://travis-ci.org/kenzdozz/support-manager-api)

The system allows customers to be able to place support requests, and support agents to process the request.

## Features

- Customers can create account.
- Customers can log in.
- Customers can create support request.
- Customers can view his/her support requests.
- Customers can comment on support request when an agent has commented.
- Agent can view all support requests.
- Agent can comment on support request.
- Agent can close a support request.
- Agent can export support requests.
- Admin can create a user account: [agent, customer, admin].
- Admin can view all support requests.
- Admin can comment on support request.
- Admin can close a support request.
- Admin can export support requests.
- Admin can delete a support requests.
- Admin can delete a user account.

## API Documentation

The API Documentation can be found on http://127.0.0.1:9090/api/docs when the app is started.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.


### Prerequisites

What things you need to have to set up the project and how to install them
To get the project up and running, you need to have mongodb, nodejs and npm installed on your local machine.
- [Download and install Nodejs here](https://nodejs.org/en/download/)
- [Download and install MongoDB](https://www.mongodb.com/)

Run the following commands to confirm installations.
```
node -v
```
 - should display Node version
```
npm -v
```
 - should display npm version
```
mongo --version
```
 - should display mongdb version


### Installing

 - Clone the repository `git clone https://github.com/kenzdozz/support-manager-api.git`
 - Navigate to the location of the folder
 - Run `npm install` to install dependencies
 - Rename `.env.example` to `.env` and update the variables accordingly
 - Run `npm run start:dev` to get the app started on your development environment
 - Run `npm run start` to get the app started on your production environment


### Seed Data to Database

To seed data to database run the command `npm run seed`, and to rollback run `npm run seed:rollback`.
After seeding, you can login with the follow accounts:
- Customer email: `john.doe@aol.com`, password: `sec123RET`
- Customer email: `janet.doe@aol.com`, password: `sec123RET`
- Agent email: `peter.pan@aol.com`, password: `sec123RET`
- Admin email: `paul.pan@aol.com`, password: `sec123RET`


## Running the tests

To run the tests, run the command
```
npm run test
```
The tests, test the api endpoints to ensure that it works and returns the required data. The output of the tests also shows the code coverage.


## Built With

* [Nodejs](https://nodejs.org/en/) - Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine
* [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
* [MongoDB](https://www.mongodb.org/) - MongoDB is a cross-platform document-oriented database program
* [JWT](https://www.npmjs.com/package/jsonwebtoken) - JSON Web Token for aunthentication

## Authors

* **Onah Kenneth** - *Initial work* - [support-manager-api](https://github.com/kenzdozz/support-manager-api)

## License

This project is licensed under the MIT License

