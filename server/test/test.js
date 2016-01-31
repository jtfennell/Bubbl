process.env.NODE_ENV = 'test';

var supertest = require('supertest');
var chai      = require('chai');
var dotenv    = require('dotenv');
var api       = require('../src/server.js');

var request   = supertest(api);
dotenv.load();

describe('Capstone api', function() {

	describe('/api/v1/tokens', function() {
		context('When it receives an unsupported method', function() {
			it('returns 405 response code', function() {
				
			});
		})	
		context('POST', function() {
			context('When request is valid', function() {

			it('returns 200 response code', function() {
		
			});

			it('returns a new token', function() {

			});

			it('returns 401 status code if account already exists with the same username', function() {

			});

			});

			context('When request is invalid', function() {
				context('When username missing', function() {
					it('returns 400 status code', function() {

					});
				});

				context('When password missing', function() {
					it('returns 400 status code', function() {

					});	
				});

				context('When password is length 0', function() {
					it('returns 400 status code', function() {

					});
				})

				context('When username is length 0', function() {
					it('returns 400 status code', function() {
						
					});
				})
			});

		})
	});

});