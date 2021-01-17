'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    host: process.env.host || "",
    dbURI: process.env.dbURI,
    dbName: process.env.dbName,
    sessionCollection: process.env.sessionCollection,
    sessionSecret: process.env.sessionSecret,
    linkedin: {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: process.env.host + '/auth/linkedin/callback',
      scope: [
        'r_emailaddress',
        'r_liteprofile'
      ]
    }
  }
} else {
  module.exports = require('./development.json');
}