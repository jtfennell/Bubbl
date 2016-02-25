require('dotenv').load();
var fs            = require('fs');
var dropAllTables = fs.readFileSync('./database/dropSchema.sql').toString();
var setUpSchema   = fs.readFileSync('./database/schema.sql').toString();
var database      = require('../database/pg-client.js');


console.log('Redeploying database...');
database.query(dropAllTables + setUpSchema, (err, result) => {
    if (err) {
        console.log(err);
    };
});

console.log('Database deployed.'); 
process.exit();