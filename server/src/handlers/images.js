var database  = require('../../../database/pg-client.js');

var images = {
    getUrls: (req, res) => {
        var typeOfImage = req.query.type;
        var groupId = req.query.groupId;

        if (!typeOfImage) {
            return res.status(400).json({"message":"type required"});
        };

        var getImages = {
            'profile': () => {
                database.query(
                    `SELECT image_id, date_uploaded, url
                    FROM users NATURAL JOIN images
                    WHERE user_id=${req.authenticatedUser.userId}`
                    , (err, result) => {
                        if (err) {
                            return res.status(500).json("internal server error");
                        }

                        if (!result.rows[0]) {
                            return res.status(404).json("no profile picture");
                        }
                        console.log(JSON.stringify(result.rows[0]));
                        return res.status(200).json({"images":[result.rows[0]]});
                    }
                );
            }, 
            'group': () => {
                if (!groupId) {
                    return res.status(400).json({"message":"group required"});
                };
                database.query(
                    `SELECT * 
                    FROM group_contains_user
                    WHERE group_id=${groupId}
                    AND user_id=${req.authenticatedUser.userId}`,
                    (err, result) => {
                        if (!result.rows[0]) {
                            return res.status(403).json({"message":"forbidden"});
                        };

                        database.query(
                            `SELECT image_id, date_uploaded, url
                            FROM group_contains_image NATURAL JOIN images
                            WHERE group_id=${req.authenticatedUser.userId}`
                            , (err, result) => {
                                if (err) {
                                    return res.status(500).json("internal server error");
                                }

                                if (!result.rows[0]) {
                                    return res.status(404).json("no profile picture");
                                }
                                return res.status(200).json({"images":[result.rows]});
                            }
                        );
                    }
                );
                
            }
        }

        if(!getImages[typeOfImage]) {
            return res.status(400).json("bad type");
        }
        getImages[typeOfImage]()
    },

    add: (req, res) => {

    },

    delete: (req, res) => {

    }
}

module.exports = images;