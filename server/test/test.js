process.env.NODE_ENV = 'test';

var supertest = require('supertest');
var dotenv    = require('dotenv');
var api       = require('../src/server.js');

var request   = supertest(api);
dotenv.load();

describe('Capstone api', function() {

    describe('/api/v1/tokens', function() {
        context('DELETE', function() {
            it('returns 405 response code', function(done) {
                request
                .delete('/api/v1/tokens')
                .expect(405, done);
            });
        })  
        context('POST', function() {
            context('When request is valid', function() {
                var user = {"username":"jeff", "password":"password"};

                it('returns 200 response code', function(done) {
                    request
                    .post('/api/v1/tokens')
                    .set('Accept','application/json')
                    .send(user)
                    .expect(200, done);
                });

                it('returns a new token', function(done) {
                    request
                    .post('/api/v1/tokens')
                    .set('Accept','application/json')
                    .send(user)
                    .expect(function(res) {
                        res.body && res.body.token !== undefined 
                    }, done);
                });
            });

            context('When request is invalid', function() {

                context('When content-type header not application/json', function() {
                    var user = {"username":"jeff", "password":"password"};

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/tokens')
                        .send(user)
                        .expect(400, done);
                    });
                })

                context('When username missing', function() {
                    it('returns 400 status code');
                });

                context('When username does not exist', function() {
                    it('returns 400 status code');
                });

                context('When password incorrect for username', function() {
                    it('returns 400 status code');
                })

                context('When password missing', function() {
                    var user = {"username":"jeff"};

                    it('returns 400 status code', function(done) {
                        request
                        .post('/api/v1/tokens')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done);
                    })
                });

                context('When password is length 0', function() {
                    it('returns 400 status code', function(done){
                        var user = {"username":"jeff"};

                        request
                        .post('/api/v1/tokens')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done);
                    });
                })

                context('When username is length 0', function() {
                    it('returns 400 status code', function(done) {
                        var user = {"username":"", "password":"password"};

                        request
                        .post('/api/v1/tokens')
                        .set('Accept', 'application/json')
                        .send(user)
                        .expect(400, done);
                    });
                })

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
        context('POST', function() {

            context('When request is valid', function() {

                it('returns 200 response code');
                it('saves a new user to the database');
                it('returns the user id of the new user');
            })

            context('When request is invalid', function() {

            })
        })
    });
});