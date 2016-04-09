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
                        
                        return res.status(200).json(result.rows);
                    }
                )
            }
        )
    },

    invite: (req, res) => {
        var usernameOfUserToInvite = req.query.username;
        var groupId = req.query.groupId;

        if (!(usernameOfUserToInvite && groupId)) {
            return res.status(400).json({"message":"username and groupId required"});
        }
        ifRequestingUserIsTheGroupAdmin(req, res, groupId, () => {
            database.query(
                `SELECT users.user_id 
                FROM group_contains_user NATURAL JOIN users
                WHERE group_id='${groupId}'
                AND username='${usernameOfUserToInvite}'`,
                (err, result) => {
                    if (err) {
                        return res.status(500).json({"message":"there was an internal server error"});
                    }

                    if (result.rows.length === 1) {
                        database.query(
                            `INSERT INTO user_invited_to_group
                            (
                                group_id,
                                user_id
                            )
                            VALUES
                            (
                                '${groupId}',
                                '${result.rows[0].user_id}'
                            )`,
                            (err, result) => {
                                if (err) {
                                    return (err.code===23505) ? res.status(422).json({"message":"user has not accepted invite"}) :
                                    res.status(500).json({"message":"there was an internal server error"})
                                };

                                return res.status(204).json({"message":"success"})
                            }
                        )
                    }
                    return res.status(404).json({"message":"user does not exist"});
                }
            );
        });   
    },

    removeFromGroup: (req, res) => {
        return res.status(501).json("not implemented");
    }
}

var ifRequestingUserIsTheGroupAdmin = (req, res, groupId, callback) => {
    database.query(
        `SELECT * 
        FROM groups 
        WHERE group_id=${groupId}`,
        (err, result) => {
            if (err) {
                return res.status(500).json({"message":"There was an internal error"});
            };            

            if (result.rows[0].admin !== req.authenticatedUser.userId) {
                return res.status(403).json({"message":"unauthorized"});
            };
            callback();
        }
    )
}

module.exports = members;