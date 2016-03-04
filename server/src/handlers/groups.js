var database  = require('../../../database/pg-client.js');

var groups = {
    getByUser: (req, res) => {
        database.query(
            `SELECT *FROM groups NATURAL JOIN group_contains_user WHERE user_id=${req.authenticatedUser.userId}`
            ,
            (err, result) => {
                if (err) {
                    return res.status(500).json({"message":"there was an internal service error."});
                };
                return res.status(200).json({"groups": result.rows});
            }
        );
    },

    create: (req, res) => {
        if (!(req.body.groupName.trim())) {
            return res.status(400).json({"message":"group name required"});
        };
        
        database.query(
            `INSERT INTO groups   
            (
                name, 
                created_on,
                admin
            )
            VALUES (
                '${req.body.groupName}',
                '${(new Date()).getTime()}',
                '${req.authenticatedUser.userId}'
            )
            RETURNING group_id`,
            (err, result) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({"message":"there was an internal server error."});
                };

                addUserToGroup(result.rows[0].group_id);
            }
        );

        var addUserToGroup = function(groupId) {
             database.query(
            `INSERT INTO group_contains_user   
            (
                group_id,
                user_id
            )
            VALUES (
                '${groupId}',
                '${req.authenticatedUser.userId}'
            )`,
            (err, result) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({"message":"there was an internal server error."});
                };
                return res.status(201).json({"message":"group created"});
            })
        }
    },

    delete: (req, res) => {
        var groupToDeleteId = req.params.groupId;

        database.query(`SELECT * FROM groups WHERE group_id=${groupToDeleteId}`, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({"message":"there was an error deleting group"});
            };

            if (!result.rows[0]) {
                return res.status(404).json({"message":"can't find group"})
            };

            if (result.rows[0].admin !== req.authenticatedUser.userId) {
                return res.status(403).json({"message":"not authorized to delete group"});
            };

             database.query(`DELETE FROM groups WHERE group_id=${groupToDeleteId}`, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({"message":"there was an error deleting group"});
            };

            database.query(`DELETE FROM group_contains_user WHERE group_id=${groupToDeleteId}`, (err, result) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({"message":"there was a error deleting group"});
                };

                return res.status(200).json({"message":"group deleted"});
            });
        });
    });

       
    },

    getMembersInGroup: (req, res) => {

    },

    inviteNewMemberToGroup: (req, res) => {
        var groupId = req.body.groupId;
        var userToAdd = req.body.userToAdd;

        if (!(groupId && userToAdd)) {
            return res.status(400).json({"message":"groupId and userId required"})
        };

        handleRequestIfGroupAdmin(req.authenticatedUser.userId, groupId, () => {
            database.query(
                `INSERT INTO user_invited_to_group
                (
                    user_id,
                    group_id
                )
                VALUES (
                    ${userToAdd},
                    ${groupId}
                )`,
                (err, result) => {
                    if (err) {
                        return res.status(500).json({"message":"there was an internal service error"});
                    };
                    return res.status(201).json({"message":"invite sent to user"});
                }

            )
        });
    },

    deleteMember: (req, res) => {

    },

    getInvitesForUser: (req, res) => {

    },

    respondToInvite: (req, res) => {

    }
}

var handleRequestIfGroupAdmin = (userId, groupId, callback) => {
    database.query(
        `SELECT admin FROM groups WHERE groupId=${groupId}`,
        (err, result) => {
            if (err) {
                return res.status(500).json({"message":"there was an internal server error."});
            };
            
            if (!result.rows) {
                return res.status(404).json({"message":"group not found"});
            };

            if (result.rows[0].userId !== userId) {
                return res.status(403).json({"message":"unauthorized"});
            };

            callback();
        }
    )
}

module.exports = groups;