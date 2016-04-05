-- Note: When adding new tables, also add the tables to dropSchema.sql and clearSchema in order for tests to work correctly.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS images (
    image_id      bigserial PRIMARY KEY,
    url           text      NOT NULL,
    date_uploaded bigint
);

CREATE TABLE IF NOT EXISTS users (
    user_id    bigserial PRIMARY KEY ,
    username   text UNIQUE NOT NULL,
    email      text NOT NULL,
    password   text NOT NULL,
    first_name text NOT NULL,
    last_name  text NOT NULL,
    image_id bigint REFERENCES images
);

CREATE TABLE IF NOT EXISTS groups (
    group_id   bigserial PRIMARY KEY,
    name       text      NOT NULL,
    created_on bigint NOT NULL,
    admin bigint REFERENCES users ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_contains_user (
    group_id bigint NOT NULL REFERENCES groups,
    user_id  bigint NOT NULL REFERENCES users,
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS user_invited_to_group (
    invite_id bigserial PRIMARY KEY,
    user_id bigint NOT NULL references users,
    group_id bigint NOT NULL references groups
);

CREATE TABLE IF NOT EXISTS group_contains_image (
    group_id bigint NOT NULL REFERENCES groups,
    image_id bigint NOT NULL REFERENCES images ON DELETE CASCADE,
    PRIMARY KEY (group_id, image_id)
);

CREATE TABLE IF NOT EXISTS user_uploads_image (
    user_id bigint NOT NULL REFERENCES users,
    image_id bigint NOT NULL REFERENCES images
);

INSERT INTO users(username, email, password, first_name, last_name) values('jeff', 'fake@email.com', crypt('password',gen_salt('bf')), 'Jeff', 'Fennell');
INSERT INTO users(username, email, password, first_name, last_name) values('SomeDude', 'fake123@email.com', crypt('password',gen_salt('bf')), 'The', 'Dude');

INSERT INTO groups(name, created_on, admin) values ('The best group', 1459821220, 1);
INSERT INTO groups(name, created_on, admin) values ('The worst group', 1459821220, 2);

INSERT INTO group_contains_user (group_id, user_id) values(1,1);
INSERT INTO group_contains_user (group_id, user_id) values(1,2);
INSERT INTO group_contains_user (group_id, user_id) values(2,2);

INSERT INTO images(url, date_uploaded) values('http://res.cloudinary.com/demo/image/upload/w_133,h_133,c_thumb,g_face,r_max/bike.jpg',1459827876);
INSERT INTO user_uploads_image (user_id, image_id) values (1,1);
UPDATE users SET image_id='1' where user_id='1';

INSERT INTO images(url, date_uploaded) values('http://res.cloudinary.com/demo/image/upload/sample.jpg', 1459821220);
INSERT INTO images(url, date_uploaded) values('http://res.cloudinary.com/demo/image/upload/sample2.jpg', 1459821220);
INSERT INTO images(url, date_uploaded) values('http://res.cloudinary.com/demo/image/upload/sample3.jpg', 1459821220);

INSERT INTO group_contains_image(group_id, image_id) values(1,2);
INSERT INTO group_contains_image(group_id, image_id) values(1,3);
INSERT INTO group_contains_image(group_id, image_id) values(2,4);