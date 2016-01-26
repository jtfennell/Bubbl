var express    = require('express');
var dotenv     = require('dotenv');
var morgan     = require('morgan');
var bodyParser = require('body-parser');
var jwt        = require('jwt-simple');
var fs         = require('fs');
var https      = require('https');
var http       = require('http');

var tokens = require('./handlers/tokens');

var app = express();

var privateKey  = fs.readFileSync(`${__dirname}../../certs/server.key`);
var certificate = fs.readFileSync(`${__dirname}../../certs/server.crt`);
var credentials = {key:privateKey, cert:certificate};

dotenv.load();

var HTTP_PORT          = process.env.HTTP_PORT      || 8080;
var HTTPS_PORT         = process.env.HTTPS_PORT     || 443;
var LOGGING_LEVEL      = process.env.LOGGING_LEVEL  || 'combined';

var methodNotAllowed = (req, res) => res.status(405).json({message: 'method not allowed'});

//unauthenticated routes
app.get('/api/v1/tokens', tokens.register);
app.post('/api/v1/tokens', tokens.refresh);
app.all('/api/v1/tokens', methodNotAllowed)

//authenticated routes

app.use(morgan(LOGGING_LEVEL));

http.createServer(app).listen(HTTP_PORT);
https.createServer(credentials, app).listen(HTTPS_PORT);

console.log(`http server listening on port ${HTTP_PORT}`);
console.log(`https server listening on port ${HTTPS_PORT}`);