var jwt       = require('jwt-simple');
var secretKey = require('../../certs/jwtKey');
var database  = require('../../../database/pg-client.js');

var tokens = {
    generate : (req, res) => { 
        if (!(req.body.username && req.body.password)) {
            return res.status(400).json({"message":"username and password required"});
        }
        console.log(req.body.username)
        console.log(req.body.password)

        database.query(`SELECT * FROM users WHERE username='${req.body.username}' AND password=crypt('${req.body.password}', password)`, (err, result) => {
            if (err) {return res.status(500).json('there was an internal server error')};
            console.log(result.rows)
            if (!result.rows[0]) {
                return res.status(404).json({'message':'username or password incorrect'});
            };

            var lastName  = result.rows[0].last_name;
            var firstName = result.rows[0].first_name;
            var userId    = result.rows[0].user_id;
            var email     = result.rows[0].email;
            var username  = result.rows[0].username;
            var imageId   = result.rows[0].image_id;

            var tokenPayload = {
                firstName: firstName,
                lastName : lastName,
                userId   : userId,
                email    : email,
                username : username,
                imageId  : imageId
            };

            var token = jwt.encode(tokenPayload, secretKey);
        
            res.status(201).json({
                "token":token,
                "user": {
                    "user_id": userId, 
                    "first_name":firstName,
                    "last_name": lastName,
                    "email":email,
                    "username":username,
                    "image_id": imageId
                }
            })
        });   
    }
};

module.exports = tokens;