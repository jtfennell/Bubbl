var jwt       = require('jwt-simple');
var secretKey = require('../../certs/jwtKey');
var database  = require('../../../database/pg-client.js');

var tokens = {
    generate : (req, res) => { 
        if (!(req.body.username && req.body.password)) {
            return res.status(400).json({"message":"username and password required"});
        }

        database.query(`SELECT * FROM users WHERE username='${req.body.username}' AND password=crypt('${req.body.password}', password)`, (err, result) => {
            if (err) {return console.log("ERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR")};
            
            if (!result.rows[0]) {
                return res.status(404).json({'message':'username or password incorrect'});
            };

            var tokenPayload = {} 

            var firstName = result.rows[0].first_name;
            var lastName = result.rows[0].last_name; 
            var userId   = result.rows[0].user_id;

            var token = jwt.encode(req.body, secretKey);
        
            res.status(201).json({
                "token":token,
                "userId": userId, 
                "firstName":firstName,
                "lastName": lastName
            })
        });   
    }
};

module.exports = tokens;