var database  = require('../../../database/pg-client.js');

var albums = {
    getByGroup: (req, res) => {
        var groupId = req.query.groupId;

        if (!groupId) {
            return res.status(400).json("bad request");
        };
 
        confirmUserInGroupAndThen(req, res, groupId, () => {
            database.query(
            `SELECT albums.name, album_id, albums.created_on, groups.group_id, created_by
            FROM groups, albums
            WHERE albums.group_id=${groupId}
            AND groups.group_id=${groupId}`,
            (err, result) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json("err")
                }
                return res.status(200).json(result.rows)
            }
        )
        })
          
    },

    getPreviewImages:(req, res) => {
        var albumId = req.query.albumId;
        var groupId = req.query.groupId;

        if (!groupId || !albumId) {
            return res.status(400).json("bad request");
        };

        confirmUserInGroupAndThen(req, res, groupId, () => {
            database.query(
                `SELECT * FROM images NATURAL JOIN album_contains_image
                WHERE album_id=${albumId}
                LIMIT 5`,
                (err, result) => {
                    if (err) {
                        return res.status(500).json("err");
                    };
                    return res.status(200).json(result.rows);
                }
            );
        });
    },

    create: (req, res) => {
        var groupId = req.body.groupId;
        var albumName = req.body.name;
        var timeNow = new Date().getTime();

        if (!groupId) {
            return res.status(400).json("bad request");
        };

        confirmUserInGroupAndThen(req, res, groupId, () => {
            database.query(
                `INSERT INTO albums(name, created_on, group_id, created_by)
                 VALUES ('${albumName}', '${timeNow}', '${groupId}','${req.authenticatedUser.userId}')
                 RETURNING name, created_on, group_id, created_by, album_id`
                ,(err, result) => {
                    if (err) {
                        if (+err.code === 23505) {
                            return res.status(409).json('duplicate album')
                        } else {
                            console.log(err)
                            return res.status(500).json('err');
                        }
                    };

                    var newAlbum = result.rows[0];
                    return res.status(200).json({
                        name:newAlbum.name,
                        createdBy:newAlbum.created_by,
                        createdOn:newAlbum.created_on,
                        groupId:newAlbum.group_id,
                        albumId:newAlbum.album_id
                    });
                })
        });

    },

    delete: (req, res) => {
        return res.status(501).json("not implemented")
    }
}

var confirmUserInGroupAndThen = (req, res, groupId, callback) => {
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
            callback();
        }
    )
}

module.exports = albums;