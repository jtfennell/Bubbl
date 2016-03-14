process.env.NODE_ENV = 'test';

var supertest = require('supertest');
var dotenv    = require('dotenv');
var should    = require('should');
var api       = require('../src/server.js');
var database  = require('../../database/pg-client.js');
var fs        = require('fs');
var request   = supertest(api);

var deleteFromAllTables = fs.readFileSync('./database/clearSchema.sql').toString();
var dropAllTables       = fs.readFileSync('./database/dropSchema.sql').toString();
var setUpSchema         = fs.readFileSync('./database/schema.sql').toString();

dotenv.load();

before(function(done) {   
   database.query(dropAllTables + setUpSchema, done);
});

beforeEach(function(done) {
    database.query(deleteFromAllTables, done)
});

var createUserNoInvite = function(callback) {
    database.query(
        `INSERT into users
        (
            username,
            email,
            password,
            first_name,
            last_name
        )
        VALUES (
            'admin',
            'fake2@email.com',
            crypt('password',gen_salt('bf')),
            'Admin',
            'Main'
        )`, 
        function(err, res) {
            database.query(
                `INSERT INTO users (
                    username,
                    email,
                    password,
                    first_name,
                    last_name
                ) 
                VALUES (
                    'jeff',
                    'fake@email.com',
                    crypt('password',gen_salt('bf')),
                    'Jeff',
                    'Fennell'
                )`,
                function(err, result) {
                    database.query(
                        `INSERT INTO groups
                        (
                            name,
                            admin,
                            created_on
                        )
                        VALUES (
                            'daBestGroup',
                            '1',
                            ${(new Date()).getTime()}
                        )`
                        , function(err, result) {
                            should.not.exist(err);
                            callback();
                        }
                    );
                }
            );
        }
    );
}
var createUserWithOneInvite = function(callback) {
    database.query(
        `INSERT into users
        (
            username,
            email,
            password,
            first_name,
            last_name
        )
        VALUES (
            'admin',
            'fake2@email.com',
            crypt('password',gen_salt('bf')),
            'Admin',
            'Main'
        )`, 
        function(err, res) {
            database.query(
                `INSERT INTO users (
                    username,
                    email,
                    password,
                    first_name,
                    last_name
                ) 
                VALUES (
                    'jeff',
                    'fake@email.com',
                    crypt('password',gen_salt('bf')),
                    'Jeff',
                    'Fennell'
                )`,
                function(err, result) {
                    database.query(
                        `INSERT INTO groups
                        (
                            name,
                            admin,
                            created_on
                        )
                        VALUES (
                            'daBestGroup',
                            '1',
                            ${(new Date()).getTime()}
                        )`, 
                        function(err, result) {
                            should.not.exist(err);

                            database.query(
                                `INSERT INTO user_invited_to_group
                                (
                                    user_id,
                                    group_id
                                )
                                VALUES 
                                (
                                    1,
                                    1
                                )`,
                                function(err, result) {
                                   should.not.exist(err)
                                   callback()
                                }
                            );
                        }
                    );
                }
            );
        }
    );
}

describe('api/v1/groups/invites', function() {
    context('GET', function() {
        context('when request is invalid', function() {
            context('when no access token provided', function() {
                it('returns 401 status code', function(done) {
                    request
                    .get('/api/v1/groups/invites')
                    .expect(401, done);
                });

                it('does not return the user\'s current invites', function(done) {
                    request
                    .get('/api/v1/groups/invites')
                    .end(function(err, res){
                        should.not.exist(err);
                        should.not.exist(res.body.invites);
                        done();
                    });
                });
            });
        });

        context('when request is valid', function() {
            it('returns 200 status code', function(done) {
                request
                .get('/api/v1/groups/invites')
                .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                .expect(200, done);
            });

            it('returns the invites a user has been sent', function(done) {
                createUserWithOneInvite(function() {
                    request
                    .get('/api/v1/groups/invites')
                    .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.invites.length.should.be.eql(1);
                        done()
                    })
                });

            });
        });
    });

    context('POST', function() {
        context('when request is invalid', function() {
            context('when no access token provided', function() {
                it('returns 401 status code', function(done) {
                    request
                    .post('/api/v1/groups/invites')
                    .expect(401, done)
                });

                it('does not accept the user\'s invite', function(done) {
                    createUserWithOneInvite(function() {
                        request
                        .post('/api/v1/groups/invites')
                        .end(function(err, res) {
                            should.not.exist(err);
                            database.query('SELECT * FROM user_invited_to_group', function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.be.eql(1);

                                database.query('SELECT * FROM group_contains_user WHERE user_id=2', function(err, result) {
                                    should.not.exist(err);
                                    result.rows.length.should.be.eql(0);
                                    done();
                                });
                            });
                        });
                    });
                });
            });

            context('when group id not specified', function() {
                it('returns 400 status code', function(done) {
                    request
                    .post('/api/v1/groups/invites')
                    .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                    .expect(400, done)
                });

                it('does not accept the user\'s invite', function(done) {
                    createUserWithOneInvite(function() {
                        request
                        .post('/api/v1/groups/invites')
                        .end(function(err, res) {
                            should.not.exist(err);
                            database.query('SELECT * FROM user_invited_to_group', function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.be.eql(1);

                                database.query('SELECT * FROM group_contains_user WHERE user_id=2', function(err, result) {
                                    should.not.exist(err);
                                    result.rows.length.should.be.eql(0);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
        
        context('when request is valid', function() {
            context('when invite does not exist', function() {
                it('returns 404 status code', function(done) {
                    createUserNoInvite(function() {
                        request
                        .post('/api/v1/groups/invites')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .send({groupId:1})
                        .expect(404, done);
                    });
                });
            });

            context('when invite exists', function() {
                it('returns 204 status code', function(done) {
                    createUserWithOneInvite(function() {
                        request
                        .post('/api/v1/groups/invites')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .send({groupId:1})
                        .expect(204, done);
                    });
                });

                it('adds user to the invite group', function(done) {
                    createUserWithOneInvite(function() {
                       request
                       .post('/api/v1/groups/invites')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                       .send({groupId:1})
                       .end(function(err, res) {
                            should.not.exist(err);
                            database.query('SELECT * FROM group_contains_user', function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.eql(1);
                                done(); 
                            });
                        });
                    });
                });

                it('deletes the invite', function(done) {
                    createUserWithOneInvite(function() {
                        request
                        .post('/api/v1/groups/invites')
                        .end(function(err, result) {
                            database.query('SELECT * FROM user_invited_to_group where user_id=2', function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.be.eql(0);
                                done();
                            });
                        });
                    });
                });
            })
        });
    });

    context('DELETE', function() {
        context('when request is invalid', function() {
            context('When no access token provided', function() {
                it('returns 401 status code', function(done) {
                    request
                    .delete('/api/v1/groups/invites/1')
                    .expect(401, done);
                });

                it('does not delete the invite', function(done) {
                    createUserWithOneInvite(function() {
                        request
                        .delete('/api/v1/groups/invites/1')
                        .end(function(err, res) {
                            database.query('SELECT * FROM user_invited_to_group', function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.be.eql(1);
                                done();
                            });
                        });     
                    });
                });
            });
        });
        
        context('when request is valid', function() {
            context('when invite does not exist', function() {
                it('returns 404 status code', function(done) {
                    createUserNoInvite(function() {
                        request
                        .delete('/api/v1/groups/invites/1')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .expect(404, done);
                    });
                });
            });

            context('when invite exists', function() {
                it('returns a 204 status code', function(done) {
                createUserWithOneInvite(function() {
                    request
                        .delete('/api/v1/groups/invites/1')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .expect(204, done);
                     });
                });

                it('deletes the user invite', function(done) {
                    createUserWithOneInvite(function() {
                        request
                        .delete('/api/v1/groups/invites/1')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .end(function(err, res) {
                            should.not.exist(err);
                            database.query('SELECT * FROM user_invited_to_group', function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.be.eql(0);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});