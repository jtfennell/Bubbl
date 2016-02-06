var jwt       = require('jwt-simple');
var secretKey = require('../../certs/jwtKey');

var tokens = {};

tokens.generate = (req, res) => { 
    var requiredHeaders = req.body.username !== undefined && req.body.password !== undefined;

  if (!requiredHeaders) {
    res.status(400).json({"message":"username and password required"});
  };

  res.sendStatus(200)  
}

module.exports = tokens;