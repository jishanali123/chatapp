'use strict';
const { MongoClient } = require('mongodb');
const config = require('../config');
let mongoClient = new MongoClient(config.dbURI).connect();

module.exports = mongoClient;