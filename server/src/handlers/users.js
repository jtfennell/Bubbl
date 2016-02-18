var database = require('../../../database/pg-client.js');
var tokens   = require('./tokens.js')

var users = {
	createUser: (req, res) => {
        if (!(req.body.username && req.body.password && req.body.email)) {
            return res.status(400).json({"message":"username, password, and email required"});
        }

        if (req.body.password.length < 8) {
            return res.status(400).json({"message":"password too short"});
        };
            
        database.query(`INSERT INTO users(username,email,password) 
                        VALUES('${req.body.username}','${req.body.email}',crypt('${req.body.password}',gen_salt('bf')))`,(err,result) =>{
                if (err) {
                   return res.status(400).json(err.code == 23505? {"message":`Username ${req.body.username} already exists`} : err)
                };
                res.status(201).json({"message":"successfully created new user"})
            });

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