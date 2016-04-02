-- Note: When adding new tables, also add the tables to dropSchema.sql and clearSchema in order for tests to work correctly.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    user_id    bigserial PRIMARY KEY ,
    username   text UNIQUE NOT NULL,
    email      text NOT NULL,
    password   text NOT NULL,
    first_name text NOT NULL,
    last_name  text NOT NULL
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