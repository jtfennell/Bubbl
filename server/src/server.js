require('dotenv').load();

var express     = require('express');
var morgan      = require('morgan');
var bodyParser  = require('body-parser');
var jwt         = require('jwt-simple');
var fs          = require('fs');
var https       = require('https');
var http        = require('http');
var users	    = require('./handlers/users');
var tokens      = require('./handlers/tokens');

var app = express();

var privateKey  = fs.readFileSync(`${__dirname}../../certs/server.key`);
var certificate = fs.readFileSync(`${__dirname}../../certs/server.crt`);
var credentials = {key:privateKey, cert:certificate};

var HTTP_PORT     = process.env.HTTP_PORT      || 8080;
var HTTPS_PORT    = process.env.HTTPS_PORT     || 443;
var LOGGING_LEVEL = process.env.LOGGING_LEVEL  || 'combined';

var methodNotAllowed = (req, res) => res.status(405)
                                        .json({message: 'method not allowed'});

app.use(bodyParser.json());
if (process.env.NODE_ENV !== 'test') {app.use(morgan(LOGGING_LEVEL));}
	
//unauthenticated routes
app.post('/api/v1/users', users.createUser);
app.all('api/v1/users', methodNotAllowed);

app.post('/api/v1/tokens', tokens.generate);
app.all('/api/v1/tokens', methodNotAllowed);

http.createServer(app).listen(HTTP_PORT);
https.createServer(credentials, app).listen(HTTPS_PORT);

if (process.env.NODE_ENV !== 'test') {
	console.log(`http server listening on port ${HTTP_PORT}`);
	console.log(`https server listening on port ${HTTPS_PORT}`);
}


module.exports = app;