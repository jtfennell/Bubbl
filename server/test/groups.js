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


describe('/api/v1/groups', function() {
    context('GET', function() {
        context('when request is invalid', function() {
            context('when no access token provided', function() {
                it('returns a 401 access code', function(done) {
                    var body = {
                        groupName:"daBestGroup"
                    }

                    request
                    .get('/api/v1/groups')
                    .set('Accept', 'application/json')
                    .send(body)
                    .expect(401, done)
                });
            });
        });

        context('when request is valid', function() {
            it('returns the groups a user is in', function(done) {
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
                        should.not.exist(err);
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
                        )`, function(err, result) {
                                database.query(
                                    `INSERT INTO group_contains_user (
                                    group_id,
                                    user_id
                                ) 
                                VALUES (
                                    '1',
                                    '1'
                                )`, function(err, result) {
                                    should.not.exist(err);
                                    request
                                    .get('/api/v1/groups')
                                    .set('Content-Type', 'application/json')
                                    .set('x-access-token','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                                    .end(function(err, res) {
                                        res.body[0].group_id.should.be.ok()
                                        done();
                                    });
                                });
                                
                            }
                        )
                    }
                );
            });
        });
    });

    context('POST', function() {
        context('when request is invalid', function() {
            context('when no access token provided', function() {
                it('returns a 401 access code', function(done) {
                    var body = {
                        groupName:"daBestGroup"
                    }

                    request
                    .post('/api/v1/groups')
                    .set('Accept', 'application/json')
                    .send(body)
                    .expect(401, done)
                });
            });
        });

        context('when request is valid', function() {
            it('creates a new group', function(done) {
                var body = {
                    groupName:'bestGroup'
                }   

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
                        should.not.exist(err);
                    
                        request
                        .post('/api/v1/groups')
                        .set('Content-Type', 'application/json')
                        .set('x-access-token','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .send(body)
                        .end(function(err, res) {
                            should.not.exist(err);

                            database.query('SELECT * FROM groups', function(err, result) {
                               should.not.exist(err);
                              
                               result.rows[0].should.be.ok();
                               done();
                            });
                        });
                    }
                );     
            });   

            it('saves the requestee as the group admin', function(done) {
                var body = {
                    groupName:'bestGroup'
                };   

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
                        should.not.exist(err);
                    
                        request
                        .post('/api/v1/groups')
                        .set('Content-Type', 'application/json')
                        .set('x-access-token','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .send(body)
                        .end(function(err, res) {
                            should.not.exist(err);

                            database.query('SELECT * FROM groups', function(err, result) {
                               should.not.exist(err);
                               result.rows[0].admin.should.be.eql('1');
                               done();
                            });
                        });
                    }
                ); 
            });

            it('saves the group name', function(done) {
                var body = {
                    groupName:'bestGroup'
                }   

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
                        should.not.exist(err);
                    
                        request
                        .post('/api/v1/groups')
                        .set('Content-Type', 'application/json')
                        .set('x-access-token','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .send(body)
                        .end(function(err, res) {
                            should.not.exist(err);

                            database.query('SELECT * FROM groups', function(err, result) {
                               should.not.exist(err);
                               result.rows[0].name.should.be.eql('bestGroup');
                               done();
                            });
                        });
                    }
                ); 
            });

            it('saves the timestamp of when the group was created', function(done) {
                var body = {
                    groupName:'bestGroup'
                }   

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
                        should.not.exist(err);
                    
                        request
                        .post('/api/v1/groups')
                        .set('Content-Type', 'application/json')
                        .set('x-access-token','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .send(body)
                        .end(function(err, res) {
                            should.not.exist(err);

                            database.query('SELECT * FROM groups', function(err, result) {
                               should.not.exist(err);
                               result.rows[0].created_on.should.match(new RegExp(/\d{12}/));
                               done();
                            });
                        });
                    }
                ); 
            });

            it('adds the creator as a member of the group', function(done) {
                var body = {
                    groupName:'bestGroup'
                }   

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
                        should.not.exist(err);
                    
                        request
                        .post('/api/v1/groups')
                        .set('Content-Type', 'application/json')
                        .set('x-access-token','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .send(body)
                        .end(function(err, res) {
                            should.not.exist(err);

                            database.query('SELECT * FROM group_contains_user', function(err, result) {
                               should.not.exist(err);
                               result.rows[0].group_id.should.be.eql('1');
                               result.rows[0].user_id.should.be.eql('1');
                               done();
                            });
                        });
                    }
                ); 
            });

            it('auto-increments the group id', function(done) {
                var body = {
                    groupName:'bestGroup'
                }   

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
                        should.not.exist(err);
                    
                        request
                        .post('/api/v1/groups')
                        .set('Content-Type', 'application/json')
                        .set('x-access-token','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKZWZmIiwibGFzdE5hbWUiOiJGZW5uZWxsIiwidXNlcklkIjoiMSIsImVtYWlsIjoiZmFrZUBlbWFpbC5jb20iLCJ1c2VybmFtZSI6InRoYUJlc3RVc2VyIn0.kUSY4d4IMZ9nV-Zc-Cx2GSYIgqLTAx8MZCW-lgcxJm8')
                        .send(body)
                        .end(function(err, res) {
                            should.not.exist(err);

                            database.query('SELECT * FROM groups', function(err, result) {
                               should.not.exist(err);
                               result.rows[0].group_id.should.be.eql('1');
                               done();
                            });
                        });
                    }
                ); 
            }); 
        });
    });
});