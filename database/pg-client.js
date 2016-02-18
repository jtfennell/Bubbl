require('dotenv').load('../../.env');
var pg = require('pg');

var connectionString = process.env.NODE_ENV == 'test'? process.env.DATABASE_TEST_CONNECT_STRING 
                                                     : process.env.DATABASE_CONNECT_STRING;
pgClient = new pg.Client(connectionString);
pgClient.connect();

module.exports = pgClient;