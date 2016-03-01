var jwt       = require('jwt-simple');
var database  = require('../../../database/pg-client.js');
var secretKey = require('../../certs/jwtKey');

module.exports = (req, res, next) => {
    var token = req.headers['x-access-token'];

    if (!token) {
       return res.status(401).json({"message":"access token required"});
    };

    try {
        req.authenticatedUser = jwt.decode(token, secretKey);
    } catch (tokenInvalidException) {
        return res.status(401).json('invalid access token');
    }
    
    next();
}