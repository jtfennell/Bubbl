ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE groups_group_id_seq RESTART WITH 1;

DELETE FROM group_contains_user;
DELETE FROM user_invited_to_group;
DELETE FROM users;
DELETE FROM groups;