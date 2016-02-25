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

describe('Bubbl api', function() {

    describe('/api/v1/tokens', function() {
        context('DELETE', function() {
            it('returns 405 response code', function(done) {
                request
                .delete('/api/v1/tokens')
                .expect(405, done);
            });
        });

        context('POST', function() {
            context('When request is valid', function() {
                context('When user exists', function() {
                    var user = {
                        "username" : "jeff",
                        "email"    : "fake@email.com",
                        "password" : "password",
                        "firstName": "Jeff",
                        "lastName" : "Fennell"
                    };

                    it('returns 201 response code', function(done) {
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
                                request
                                .post('/api/v1/tokens')
                                .set('Accept','application/json')
                                .send(user)
                                .expect(201, done);
                            }
                        );
                    });
                    
                    it('creates and returns a jwt for the new user', function(done) {
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
                                request
                                .post('/api/v1/tokens')
                                .set('Accept','application/json')
                                .send(user)
                                .end(function(err, res) {
                                    res.body.token.should.be.ok();
                                    done();
                                });
                            }
                        );
                    });
                    
                    it('returns the id of the user', function(done) {
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
                                request
                                .post('/api/v1/tokens')
                                .set('Accept','application/json')
                                .send(user)
                                .end(function(err, res) {
                                    res.body.userId.should.be.ok();
                                    done();
                                });
                            }
                        );
                    });
                    
                    it('returns the first name of the user', function(done) {
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
                                request
                                .post('/api/v1/tokens')
                                .set('Accept','application/json')
                                .send(user)
                                .end(function(err, res) {
                                    res.body.firstName.should.be.ok();
                                    done();
                                });
                            }
                        );
                    });
                    
                    it('returns the last name of the user', function(done) {
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
                                request
                                .post('/api/v1/tokens')
                                .set('Accept','application/json')
                                .send(user)
                                .end(function(err, res) {
                                    res.body.lastName.should.be.ok();
                                    done();
                                });
                            }
                        );
                    });
                });  

                context('When user does not exist', function() {
                    var user = {
                        "username" : "jeff",
                        "email"    : "fake@email.com",
                        "password" : "password",
                        "firstName": "Jeff",
                        "lastName" : "Fennell"
                    };

                    it('returns a 404 status code', function(done) {
                        request
                        .post('/api/v1/tokens')
                        .set('Accept','application/json')
                        .send(user)
                        .expect(404, done)
                    });

                    it('does not return a token', function() {
                        var user = {"username":"jeff","password":"password", "email" : "fake@email.com"}

                        it('returns a 404 status code', function(done) {
                            request
                            .post('api/v1/tokens')
                            .set('Accept', 'application/json')
                            .send(user)
                            .end(function(err, res) {
                                res.body.token.should.not.be.ok();
                            })
                        });
                    })
                });            
            });

            context('When request is invalid', function() {
                context('When username missing', function() {
                    var user = {"password":"password","email":"email@email.com"};

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/tokens')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done);
                    });
                });

                context('When username does not exist', function() {
                    var user = {
                        "username": "jeff",
                        "password": "password"
                    }

                    it('returns 404 status code', function(done) {
                        request
                        .post('/api/v1/tokens')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(404, done)
                    });
                });

                context('When password incorrect for username', function() {
                    it('returns 404  status code', function(done) {
                        var user = {
                            "username": "jeff",
                            "password": "theWrongPassword"
                        }

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
                            request
                            .post('/api/v1/tokens')
                            .set('Accept', 'application/json')
                            .send(user)
                            .expect(404, done)
                        )
                    });
                });

                context('When password missing', function() {
                    var user = {"username": "jeff", "email": "fake@email.com"};

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/tokens')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done);
                    });
                });

                context('When password is length 0', function() {
                    it('returns 400 status code', function(done){
                        var user = {"username":"jeff", "email": "fake@email.com"};

                        request
                        .post('/api/v1/tokens')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done);
                    });
                });

                context('When username is length 0', function() {
                    it('returns 400 status code', function(done) {
                        var user = {"username":"", "password":"password"};

                        request
                        .post('/api/v1/tokens')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done);
                    });
                });

                context('When username is length 0', function() {
                    it('returns 400 status code', function(done) {
                        var user = {"username":"", "password":"password"};

                        request
                        .post('/api/v1/tokens')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done);
                    });
                });

                context('When username invalid case', function() {
                    it('returns 404 status code', function(done) {
                        var user = {
                            "username": "Jeff",
                            "password": "password"
                        }

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
                            request
                            .post('/api/v1/tokens')
                            .set('Accept', 'application/json')
                            .send(user)
                            .expect(404, done)
                        );
                    });
                });

                context('When password invalid case', function() {
                    it('returns 400 status code', function(done) {
                        var user = {
                            "username": "jeff",
                            "password": "Password"
                        }

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
                            request
                            .post('/api/v1/tokens')
                            .set('Accept', 'application/json')
                            .send(user)
                            .expect(404, done)
                        );
                    });
                });
            });
        })
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
                context('When username already taken', function(done) { 
                    database.query('INSERT INTO users(username,email,password) VALUES(\'jeff\',\'fake@email.com\',\'password\')', function(err, result) {
                        var user = {"username":"jeff","password":"blah","email":"other@email.com"}

                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done)
                    });
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
                    it('returns 400 status code', function(done) {
                        var user = {"password":"jeff"}

                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done)
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
                });
            });
        });
    });
});