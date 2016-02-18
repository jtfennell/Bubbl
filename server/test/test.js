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
                    var user = {"username": "jeff", "password": "password"};

                    it('returns 200 response code', function(done) {
                        request
                        .post('/api/v1/tokens')
                        .set('Accept','application/json')
                        .send(user)
                        .expect(200, done);
                    });

                    it('creates and returns a jwt for the new user');

                    it('returns the id of the user', function(done) {
                        var user = {"username":"jeff","password":"password"}

                        request
                        .post('/api/v1/tokens')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            res.body.id.should.be.ok();
                            done();
                        })
                    });

                    it('returns the first name of the user');
                    it('returns the last name of the user');
                });  

                context('When user does not exist', function() {
                    it('returns a 404 status code');
                });            
            });

            context('When request is invalid', function() {

                context('When content-type not set to application/json', function() {
                    var user = {"username":"jeff", "password":"password"};

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/tokens')
                        .send(user)
                        .expect(400, done);
                    });
                });

                context('When username missing', function() {
                    var user = {"password":"password","email":"email@email.com"};

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/tokens')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done);
                    })
                });

                context('When username does not exist', function() {
                    it('returns 400 status code');
                });

                context('When password incorrect for username', function() {
                    it('returns 400 status code');
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
                    it('returns 400 status code');
                });

                context('When password invalid case', function() {
                    it('returns 400 status code');
                });
            });
        })
    });
    
    describe('/api/v1/users', function() {
        context('DELETE', function() {
            it('returns method not supported');
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
                    
                })

                context('When username not already taken', function() {
                    var user = {"username":"jeff","password":"password","email":"fake@email.com"}
                
                    it('returns 201 response code', function(done) {
                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(201, done)
                    });

                    it('saves a new user to the database', function(done) {
                        var user = {"username":"jeff","password":"password","email":"fake@email.com"}

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
                        database.query('INSERT INTO users(username, email, password) VALUES(\'jeff\',\'fake@email.com\',\'password\')', function(err, result) {
                            database.query('SELECT * FROM users', function(err, result) {
                                should.not.exist(err);
                                result.rows[0].user_id.should.be.equal('1');
                                done();
                            });
                        }); 
                    })

                    it('returns the user id of the new user', function(done) {
                        var user = {"username":"jeff","password":"password"}

                        request
                        .post('/api/v1/users')
                        .set('Accept', 'application/json')
                        .send(user)
                        .end(function(err, res) {
                            res.body.id.should.be.ok();
                            done();
                        })
                    });

                    it('creates and returns a jwt for the new user');
                    it('returns the first name of the user');
                    it('returns the last name of the user');
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

                context('When content-type not set to application/json', function() {
                    var user = {"username":"jeff", "password":"password"};

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/users')
                        .send(user)
                        .expect(400, done);
                    });
                })
            })
        })
    });
});