var database  = require('../../../database/pg-client.js');

var invites = {
    getForUser: (req, res) => {
       database.query(
            `SELECT * 
            FROM user_invited_to_group 
            WHERE user_id=${req.authenticatedUser.userId}`
        , (err, result) => {
            if (err) {
                return res.status(500).json({"message":"There was an internal service error"})
            };
            return res.status(200).json({"invites":result.rows});
       });
    },

    accept: (req, res) => {
        var idOfgroupToJoin = req.body.groupId;

        if (!idOfgroupToJoin) {
            return res.status(400).json({"message":"group id required"});
        };

        database.query (
            `SELECT * FROM user_invited_to_group 
            WHERE user_id=${req.authenticatedUser.userId}
            and group_id=${idOfgroupToJoin}`
            , function(err, result) {
                if (result.rows.length === 0) {
                    return res.status(404).json({"message":"invite does not exist"});
                };

                database.query(
                    `INSERT INTO group_contains_user
                    (
                        group_id,
                        user_id
                    ) VALUES (
                        ${idOfgroupToJoin},
                        ${req.authenticatedUser.userId}
                    )`
                    , function(err, result) {
                        if (err) {
                            return res.status(500).json({"message":"there was an internal server error"});
                        };

                        database.query(
                            `DELETE FROM user_invited_to_group 
                             WHERE user_id=${req.authenticatedUser.userId} and group_id=${idOfgroupToJoin}`
                        , function(err, result) {
                            if (err) {
                                return res.status(500).json({"message":"there was an internal server error"});
                            };

                            return res.status(204).json({"message":"added to group"});
                        });
                    }
                );
            }
        );
    },

    delete: (req, res) => {
        var inviteToDelete = req.params.inviteId;
        
        database.query (
            `SELECT * FROM user_invited_to_group 
            WHERE invite_id=${inviteToDelete}`
            , 
            function(err, result) {
                if (result.rows.length === 0) {
                    return res.status(404).json({"message":"invite does not exist"});
                };

                database.query(
                    `DELETE FROM user_invited_to_group 
                     WHERE invite_id=${inviteToDelete}`
                    , function(err, result) {
                       if (err) {
                           return res.status(500).json({"message":"Internal server error"});
                       };
                       return res.status(204).json({"message":"invite deleted"});
                    }
                )
            }
        )
    }
}

module.exports = invites;