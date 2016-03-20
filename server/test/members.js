'use strict';
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

var createGroupWithTwoMembers = function(callback1) {
    var create2Users = function(callback2) {
        database.query(
            `INSERT INTO users(
                username,
                email,
                password,
                first_name,
                last_name
            ) 
            VALUES(
                'jeff',
                'fake@email.com',
                crypt('password',gen_salt('bf')),
                'Jeff',
                'Fennell'
            )`
        , function(err, result) {
            should.not.exist(err);
            database.query(
                `INSERT INTO users(
                    username,
                    email,
                    password,
                    first_name,
                    last_name
                ) 
                VALUES(
                    'new',
                    'fake2@email.com',
                    crypt('password',gen_salt('bf')),
                    'Fake',
                    'User'
                )`
            , function(err, result) {
                should.not.exist(err);
                callback2();
            })
        })
    }

    var createGroup = function(callback3) {
        database.query(
            `INSERT INTO groups (
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
                callback3();
            }
        );
    }

    var addUsersToGroup = function() {
        database.query(
            `INSERT INTO group_contains_user (
                group_id,
                user_id
            ) 
            VALUES (
                '1',
                '1'
            )`,
            function(err, result) {
                should.not.exist(err);
                database.query(
                    `INSERT INTO group_contains_user (
                        group_id,
                        user_id
                    ) 
                    VALUES (
                        '1',
                        '2'
                    )`,
                    function(err, result) {
                        should.not.exist(err);
                        callback1();
                    }
                );
            }
        );
    }
    create2Users(function(){
        createGroup(function() {
            addUsersToGroup();
        })
    });
}

describe('api/v1/members', function() {
    context('GET', function() {
        context('when request invalid', function() {
            context('when no access token provided', function() {
                it('returns 401 status code', function(done) {
                    request
                    .get('/api/v1/members?groupId=1')
                    .expect(401, done);
                });

                it('does not return the list of members in the group', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .get('/api/v1/members?groupId=1')
                        .end(function(err, res) {
                            should.not.exist(err);
                            should.not.exist(res.body.members);
                            done();
                        });
                    });
                });
            });

            context('when no groupId query parameter provided', function() {
                it('returns 400 status code', function(done) {
                    request
                    .get('/api/v1/members')
                    .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                    .expect(400, done);
                });
                
                it('does not return a list of members', function(done) {
                    request
                    .get('/api/v1/members')
                    .end(function(err, res) {
                        should.not.exist(res.body.members);
                        done();
                    });
                });
            });
        });

        context('when request valid', function() {
            it('returns 200 status code', function(done) {
                createGroupWithTwoMembers(function() {
                    request
                    .get('/api/v1/members?groupId=1')
                    .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                    .expect(200, done);
                });
            });

            it('returns list of members in specified group', function(done) {
                createGroupWithTwoMembers(function() {
                    request
                    .get('/api/v1/members?groupId=1')
                    .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                    .end(function(err, res){
                        should.exist(res.body.members);
                        console.log(res);
                        res.body.members.length.should.be.eql(2);
                        done();
                    });
                });
            });
        });
    });

    context('POST', function() {
        context('when request invalid', function() {
            context('when no access token provided', function() {
                it('returns 401 status code', function(done) {
                    request
                    .post('/api/v1/members?groupId=1')
                    .expect(401, done);
                });

                it('does not invite a member to a group', function(done) {
                    request
                    .post('/api/v1/members?groupId=1')
                    .end(function(err, res) {
                        should.not.exist(err);
                        database.query(
                            'SELECT * FROM user_invited_to_group',
                            function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.be.eql(0);
                                done();
                            }
                        );
                    });
                });
            });

            context('when no groupId query parameter provided', function() {
                it('returns 400 status code', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?userId=3')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .expect(400, done);
                    });
                });

                it('does not invite the user to the group', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?userId=3')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .end(function(err, res) {
                            database.query(
                                'SELECT * FROM user_invited_to_group',
                                function(err, result) {
                                    should.not.exist(err);
                                    result.rows[0].length.should.be.eql(0);
                                    done();
                                }
                            );
                        });
                    });
                });
            });

            context('when no userId query parameter provided', function() {
                it('returns 400 status code', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?groupId=1')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .expect(400, done);
                    });
                });

                it('does not invite the user to the group',function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?groupId=3')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .end(function(err, res) {
                            database.query(
                                'SELECT * FROM user_invited_to_group',
                                function(err, result) {
                                    should.not.exist(err);
                                    result.rows[0].length.should.be.eql(0);
                                    done();
                                }
                            );
                        });
                    });
                });
            });
        });
        
        context('when request valid', function() {
            context('when user requesting is the group admin', function() {
                it('returns 204 status code', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?groupId=1')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .expect(204, done)
                    });
                });

                it('creates an invite for the user', function(done) {
                    createGroupWithTwoMembers(function() {
                        database.query(
                            `INSERT INTO users(
                                username,
                                email,
                                password,
                                first_name,
                                last_name
                            ) 
                            VALUES(
                                'jeff7',
                                'fake@email.com',
                                crypt('password',gen_salt('bf')),
                                'Jeff',
                                'Fennell'
                            )`,
                            function() {
                                request
                                .post('/api/v1/members?groupId=1&userId=3')
                                .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                                .end(function(err, res) {
                                    should.not.exist(err);
                                    database.query(
                                        'SELECT * FROM user_invited_to_group',
                                        function(err, result) {
                                            should.not.exist(err);
                                            should.exist(result.rows[0]);
                                            result.rows[0].user_id.should.be.eql(3);
                                            result.rows[0].group_id.should.be.eql(1);
                                        }
                                    );
                                });
                            }
                        );
                    });
                });
            });
            
            context('when user requesting is not the group admin', function() {
                it('returns 403 status code', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?groupId=1&userId=3')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMiIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6ImplZmZUaGFCZXN0In0.tjnyms0-7_Gg6ytGXO5g0CPL__szHoT8jQWZQLEd-34')
                        .expect(403, done)
                    });
                });

                it('does not invite the user to the group', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?groupId=1&userId=3')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMiIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6ImplZmZUaGFCZXN0In0.tjnyms0-7_Gg6ytGXO5g0CPL__szHoT8jQWZQLEd-34')
                        .end(function(err, res) {
                            should.not.exist(err);
                            database.query(
                                'SELECT * FROM user_invited_to_group',
                                function(err, result) {
                                    should.not.exist(err);
                                    result.rows.length.should.be.eql(0);
                                    done();
                                }
                            );
                        });
                    });
                });
            });
        });
    });

    context('DELETE', function() {
        context('when request invalid', function() {
            context('when no access token provided', function() {
                it('returns 401 status code', function(done) {
                    request
                    .get('/api/v1/members?groupId=1')
                    .expect(401);
                    done();
                });

                it('does not remove the user from the group', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?groupId=1&userId=2')
                        .end(function(err, res) {
                            should.not.exist(err);
                            database.query(
                                'SELECT * FROM group_contains_user',
                                function(err, result) {
                                    should.not.exist(err);
                                    result.rows.length.should.be.eql(2);
                                    done();
                                }
                            );
                        });
                    });
                })
            });
        });
        
        context('when request valid', function() {
            context('when user requesting is not the group admin', function() {
                it('returns 403 status code', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?groupId=1&userId=1')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMiIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6ImplZmZUaGFCZXN0In0.tjnyms0-7_Gg6ytGXO5g0CPL__szHoT8jQWZQLEd-34')
                        .expect(403, done);
                    });
                });

                it('does not remove user from group', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?groupId=1&userId=2')
                        .end(function(err, res) {
                            should.not.exist(err);
                            database.query(
                                'SELECT * FROM group_contains_user',
                                function(err, result) {
                                    should.not.exist(err);
                                    result.rows.length.should.be.eql(2);
                                    done();
                                }
                            );
                        });
                    })
                });
            });

            context('when user requesting is the group admin', function() {
                it('returns 204 status code', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?groupId=1&userId=2')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .expect(204, done);
                    });
                });

                it('removes the user from the group', function(done) {
                    createGroupWithTwoMembers(function() {
                        request
                        .post('/api/v1/members?groupId=1&userId=2')
                        .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .end(function(err, res) {
                            database.query(
                                'SELECT * FROM group_contains_user WHERE group_id=1',
                                function(err, result) {
                                    should.not.exist(err);
                                    result.rows.length.should.be.eql(1);
                                    result.rows[0].userId.should.be.eql(1);
                                    result.rows[0].groupId.should.be.eql(1);
                                    done()
                                }
                            )
                        });
                    });
                });
            });
        });
    });
});