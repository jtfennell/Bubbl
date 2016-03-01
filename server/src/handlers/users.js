var database = require('../../../database/pg-client.js');
var tokens   = require('./tokens.js')

var users = {
	create: (req, res) => {
        if (!(req.body.username 
            && req.body.password 
            && req.body.email
            && req.body.firstName
            && req.body.lastName)
        ) {
            return res.status(400).json({"message":"username, password, email, firstName, lastName required."});
        }

        if (req.body.password.length < 8) {
            return res.status(400).json({"message":"password too short"});
        };
        
        database.query(
            `INSERT INTO users(username, email, password, first_name, last_name) 
            VALUES(
                '${req.body.username}',
                '${req.body.email}', 
                crypt('${req.body.password}',gen_salt('bf')),
                '${req.body.firstName}',
                '${req.body.lastName}'
            )`,
            (err,result) => {
                if (err) {
                    console.log('here')
                    return res.status(400).json(err.code == 23505? {"message":`Username ${req.body.username} already exists`} : err)
                };

                tokens.generate(req, res);
            }
        );
    },

    getUser: (username, password) => {
        database.connect((err) => {
            if (err) {
                internalError();
            };

            database.query(`SELECT FROM users WHERE username=${username} AND password=crypt(${password},gen_salt('bf')`);
        });
    }
}

var internalError = err => {return res.status(501).json({"message":"There was an internal server error"})};

module.exports = users;