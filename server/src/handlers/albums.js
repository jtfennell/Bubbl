var database  = require('../../../database/pg-client.js');

var albums = {
    getByGroup: (req, res) => {
        var groupId = req.query.groupId;

        if (!groupId) {
            return res.status(400).json("bad request");
        };

        database.query(
            `SELECT * from group_contains_user 
            WHERE user_id=${req.authenticatedUser.userId}
            AND group_id=${groupId}`,
            (err, result) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                };

                if (result.rows.length === 0) {
                    return res.status(403).json("unauthorized");
                };
                
                database.query(
                    `SELECT albums.name, album_id, albums.created_on, groups.group_id, created_by
                    FROM groups, albums
                    WHERE groups.group_id=${groupId}`,
                    (err, result) => {
                        if (err) {
                            console.log(err)
                            return res.status(500).json("err")
                        }
                        return res.status(200).json(result.rows)
                    }
                )
            }
        )
    },

    create: () => {

    },

    delete: () => {

    }
}

module.exports = albums;