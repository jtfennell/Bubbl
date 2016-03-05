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
var groups      = require('./handlers/groups');

var requireAccessToken = require('./middleware/requireAccessToken');

var app = express();

var privateKey  = fs.readFileSync(`${__dirname}../../certs/server.key`);
var certificate = fs.readFileSync(`${__dirname}../../certs/server.crt`);
var credentials = {key:privateKey, cert:certificate};

var HTTP_PORT     = process.env.HTTP_PORT      || 8080;
var HTTPS_PORT    = process.env.HTTPS_PORT     || 443;
var LOGGING_LEVEL = process.env.LOGGING_LEVEL  || 'combined';

morgan.token('body', (req) => {
  return JSON.stringify(req.body);
});

var methodNotAllowed = (req, res) => res.status(405)
                                        .json({message: 'method not allowed'});

app.use(bodyParser.json());
if (process.env.NODE_ENV !== 'test') {app.use(morgan(LOGGING_LEVEL));}
	

app.post('/api/v1/users', users.create);
app.all('/api/v1/users', methodNotAllowed);

app.post('/api/v1/tokens', tokens.generate);
app.all('/api/v1/tokens', methodNotAllowed);

app.post('/api/v1/groups',             [requireAccessToken, groups.create]);
app.get('/api/v1/groups',              [requireAccessToken, groups.getByUser]);
app.delete('/api/v1/groups/:groupId',  [requireAccessToken, groups.delete]);

// app.get('/api/v1/groups/:groupId/members',             [requireAccessToken, groups.getMembersInGroup]);
// app.post('/api/v1/groups/:groupId/members',             [requireAccessToken, groups.inviteNewMemberToGroup]);
// app.delete('/api/v1/groups/:groupId/members/:memberId', [requireAccessToken, groups.deleteMember]);

// app.get('/api/v1/groups/invites',           [requireAccessToken, groups.getInvitesForUser]);
// app.post('/api/v1/groups/invites',          [requireAccessToken, groups.respondToInvite]);
// app.use('/api/v1/groups',                   methodNotAllowed);

http.createServer(app).listen(HTTP_PORT);
https.createServer(credentials, app).listen(HTTPS_PORT);

if (process.env.NODE_ENV !== 'test') {
	console.log(`http server listening on port ${HTTP_PORT}`);
	console.log(`https server listening on port ${HTTPS_PORT}`);
}

module.exports = app;