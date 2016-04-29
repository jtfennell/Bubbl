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
var invites     = require('./handlers/invites');
var members     = require('./handlers/members');
var images      = require('./handlers/images');
var albums      = require('./handlers/albums');

var requireAccessToken = require('./middleware/requireAccessToken');

var app = express();

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

app.get('/api/v1/groups',             [requireAccessToken, groups.getByUser]);
app.post('/api/v1/groups',            [requireAccessToken, groups.create]);
app.delete('/api/v1/groups/:groupId', [requireAccessToken, groups.delete]);
app.use('/api/v1/groups',             methodNotAllowed);

app.get('/api/v1/invites',               [requireAccessToken, invites.getForUser]);
app.post('/api/v1/invites',              [requireAccessToken, invites.accept]);
app.delete('/api/v1/invites/:inviteId',  [requireAccessToken, invites.delete]);
app.use('/api/v1/invites',               methodNotAllowed);

app.get('/api/v1/members',              [requireAccessToken, members.getByGroup]);
app.post('/api/v1/members',             [requireAccessToken, members.invite]);
app.delete('/api/v1/members/:memberId', [requireAccessToken, members.removeFromGroup]);
app.use('/api/v1/members',              methodNotAllowed);

app.get('/api/v1/images', [requireAccessToken, images.getUrls]);
// type=profile | group&groupId=__ | album&albumId=__
app.post('/api/v1/images', [requireAccessToken, images.add]);
// type=profile | group&groupId=__ | album&albumId=__
app.delete('/api/v1/images/:imageId', [requireAccessToken, images.delete]);
app.use('api/v1/images', methodNotAllowed);

app.get('/api/v1/albums', [requireAccessToken, albums.getByGroup]);
app.get('/api/v1/albums/preview', [requireAccessToken, albums.getPreviewImages]);
app.post ('/api/v1/albums', [requireAccessToken, albums.create]);
app.delete('/api/v1/albums', [requireAccessToken, albums.delete]);
//add one to get all photos in an album
app.use('/api/v1/albums', methodNotAllowed);

http.createServer(app).listen(HTTP_PORT);

if (process.env.NODE_ENV !== 'test') {
	console.log(`http server listening on port ${HTTP_PORT}`);
}

module.exports = app;