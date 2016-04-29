ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE groups_group_id_seq RESTART WITH 1;
ALTER SEQUENCE user_invited_to_group_invite_id_seq RESTART WITH 1;
ALTER SEQUENCE images_image_id_seq RESTART WITH 1;
ALTER SEQUENCE albums_album_id_seq RESTART WITH 1;

DELETE FROM album_contains_image;
DELETE FROM albums;
DELETE FROM group_contains_user;
DELETE FROM user_invited_to_group;
DELETE FROM users;
DELETE FROM groups;
DELETE FROM user_picks_profile_image;
DELETE FROM group_contains_image;
DELETE FROM images;