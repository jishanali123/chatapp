'use strict';
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
const config = require('../config');

var store = new MongoDBStore({
  uri: config.dbURI,
  databaseName: config.dbName,
  collection: config.sessionCollection
});

if (process.env.NODE_ENV === 'production') {
  // Initialize session with settings for production
  module.exports = session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: store,
  });
} else {
  // Initialize session with settings for dev
  module.exports = session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
  });
}