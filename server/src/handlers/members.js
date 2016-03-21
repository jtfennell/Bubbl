var database  = require('../../../database/pg-client.js');

var members = {
    getByGroup: (req, res) => {
        var groupId = req.query.groupId;
        
        if (!groupId) {
            return res.status(400).json({"message":"groupId and userId required"});
        };

        database.query(
            `SELECT * 
            FROM group_contains_user
            WHERE user_id=${req.authenticatedUser.userId}
            AND group_id=${groupId}`,
            (err, result) => {
                if (err) {
                    return res.status(500).json({"message":"there was an internal server error"});
                };

                if (!result.rows[0]) {
                    return res.status(403).json({"message":"unauthorized"});
                };

                database.query(
                    `SELECT users.user_id, username, email, first_name, last_name 
                    FROM group_contains_user NATURAL JOIN users
                    WHERE group_id=${groupId}`,
                    (err, result) => {
                        if (err) {
                            
                            return res.status(500).json({"message":"there was an internal server error"});
                        };
                        
                        return res.status(200).json({"members":result.rows});
                    }
                )
            }
        )
    },

    invite: (req, res) => {
        return res.status(501).json("not implemented");
    },

    removeFromGroup: (req, res) => {
        return res.status(501).json("not implemented");
    }
}

var ifUserIsAdmin = (req, res, callback) => {
    database.query(
            `SELECT * 
            FROM groups 
            WHERE group_id=${groupId}`,
            (err, result) => {
                if (err) {
                    //return res.status(500)
                    console.log(err);
                };
                
                if (result.rows[0].admin !== req.authenticatedUser.userId) {
                    return res.status(403).json({"message":"unauthorized"});
                };
                callback()
            }
        )
}

module.exports = members;