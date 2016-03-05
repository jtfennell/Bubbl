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

describe('/api/v1/users', function() {
        context('DELETE', function(done) {
            it('returns 405 status code', function() {
                var user = {
                    "username": "jeff",
                    "password": "Password"
                }

                request
                .post('/api/v1/tokens')
                .set('Accept', 'application/json')
                .send(user)
                .expect(405, done)

            });
        })

        context('POST', function() {

            context('When request is valid', function() {
                context('When username already taken', function() { 
                    
                    var user = {
                        "username":"jeff",
                        "password":"blah",
                        "email":"other@email.com",
                        "firstName":"Jeff",
                        "lastName":"Fennell"
                     }

                    it('returns a 400 status code', function(done) {
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
                            )`, (err,result) => {
                                if (err) {
                                    throw new Error(JSON.stringify(err));
                                };

                                request
                                .post('/api/v1/users')
                                .set('Accept', 'application/json')
                                .send(user)
                                .expect(400, done)
                            }
                        );
                    });
                    
                    it('does not create a duplicate user', function(done) {
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
                            )`, (err,result) => {
                                if (err) {
                                    throw new Error(JSON.stringify(err));
                                };

                                request
                                .post('/api/v1/users')
                                .set('Accept', 'application/json')
                                .send(user)
                                .end(function(err, res) {
                                        database.query(`SELECT * FROM users`, function(err, result) {
                                        result.rows.length.should.be.eql(1);
                                        done();
                                    });
                                });
                            }
                        );
                    })
                });

                context('When username not already taken', function() {
                    var user = {
                        "username":"jeff",
                        "password":"password",
                        "email":"fake@email.com",
                        "firstName":"Jeff",
                        "lastName":"Fennell"
                    }
                
                    it('returns 201 response code', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(201, done)
                    });

                    it('saves a new user to the database', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            database.query('SELECT * FROM users', function(err, result) {
                                should.not.exist(err)
                                result.rows[0].username.should.be.equal('jeff');
                                result.rows[0].email.should.be.equal('fake@email.com');
                                done();
                            });
                        });
                    });


                    it('auto-increments id for the new user', function(done) {
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
                            )`, 
                            function() {
                               database.query('SELECT * FROM users', function(err, result) {
                                    should.not.exist(err);
                                    result.rows[0].user_id.should.be.equal('1');
                                    done();
                                });
                            }
                        );
                    });

                    it('returns the user id of the new user', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            res.body.userId.should.be.ok();
                            done();
                        });
                    });

                    it('creates and returns a jwt for the new user', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            res.body.token.should.be.ok();
                            done();
                        });
                    });

                    it('returns the first name of the user', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            res.body.firstName.should.be.ok();
                            done();
                        });
                    });

                    it('returns the last name of the user', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            res.body.lastName.should.be.ok();
                            done();
                        });
                    });
                });
            });

            context('When request is invalid', function() {
                context('When request does not contain a username', function() {
                    var user = {"password":"jeff"}

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done)
                    });

                    it('does not create a user', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            database.query('SELECT * FROM users', function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.be.eql(0);
                                done();
                            })
                        });
                    });
                });

                context('When request does not contain a password', function() {
                    var user = {"username":"jeff","email":"fake@email.com"}

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done)
                    });

                    it('does not create a user', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            database.query('SELECT * FROM users', function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.be.eql(0);
                                done();
                            })
                        });
                    });
                });

                 context('When request does not contain an email address', function() {
                    var user = {"username":"jeff","password":"password"}

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done)
                    });

                    it('does not create a user', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            database.query('SELECT * FROM users', function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.be.eql(0);
                                done();
                            })
                        });
                    })
                });

                context('When password is too short', function() {
                    var user = {"username":"jeff", "password":"short"}

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done)
                    });

                    it('does not create a user', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            database.query('SELECT * FROM users', function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.be.eql(0);
                                done();
                            })
                        });
                    });
                });

                context('When request does not contain user first name', function() {
                    var user = {
                        username:"jeff",
                        password:"password",
                        email:"dabest@email.com",
                        lastName:"Fennell"
                    }

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done)
                    });

                    it('does not create a user', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            database.query('SELECT * FROM users', function(err, result) {
                                should.not.exist(err);
                                result.rows.length.should.be.eql(0);
                                done();
                            });
                        });
                    });
                });

                context('When request does not contain user last name', function(done) {
                     var user = {
                        username:"jeff",
                        password:"password",
                        email:"dabest@email.com",
                        firstName:"Jeff"
                    }

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done)
                    });

                    it('does not create a user', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            database.query('SELECT * FROM users', function(err, result) {
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