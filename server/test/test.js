var request = require('supertest');
var should  = require('should');
var dotenv  = require('dotenv');

dotenv.load();
var port = process.env.API_port;

describe('Capstone api') => {

	it('Returns 200 response code when it receives a token request', done => {
		request(`http://localhost:${port}`)
	})
