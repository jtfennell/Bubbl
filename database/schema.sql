-- Note: When adding new tables, also add the tables to dropSchema.sql and clearSchema in order for tests to work correctly.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    user_id bigserial PRIMARY KEY ,
    username text UNIQUE NOT NULL,
    email text NOT NULL,
    password text NOT NULL
);
