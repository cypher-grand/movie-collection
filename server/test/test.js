/**
 * Make any/all changes you see fit based on your experience. Every detail you (do not) change will be subject to
 * questioning during the in person interview.
 *
 * Good luck.
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../');
const should = chai.should();

chai.use(chaiHttp)
let user, movie

describe('Authentication Tests', function() {
  const newUser = {
    email: `coolguyaaron@gmail.com`,
    password: 'ASecretSoBigNoOneCanBreak'
  }
  const wrongPasswordUser = {
    email: `coolguyaaron@gmail.com`,
    password: 'password'
  }

  // this is expected to work the first time. Fail everytime thereafter
  describe('User Registration', function() {
    it('Should register a new user', function(done) {
      chai.request(server).post('/register').send(newUser).end(function (err, res) {
        assert.equal(err, undefined)
        assert.equal(res.body.success, true)
        assert.equal(res.body.message, "Created account")
        res.should.have.status(201);
        res.body.user.should.be.a('object');
        res.body.user.should.have.property('_id');
        res.body.user.should.have.property('email')
        res.body.user.should.have.property('token');
        done();
      });
    });

    it('Should fail to register with an email already taken', function(done) {
      chai.request(server).post('/register').send(newUser).end(function (err, res) {
        assert.equal(err, undefined)
        res.should.have.status(200);
        assert.equal(res.body.success, true)
        res.body.success.should.be.a('boolean');
        assert.equal(res.body.message, "User with that email already taken.")
        res.body.should.not.have.property('user')
        done();
      });
    });
  });

  describe('Login', function() {
    it('Should login successfully', function (done) {
      chai.request(server).post('/login').send(newUser).end(function (err, res) {
        assert.equal(err, undefined)
        assert.equal(res.body.success, true)
        res.should.have.status(200);
        res.body.user.should.be.a('object');
        res.body.user.should.have.property('_id');
        res.body.user.should.have.property('email');
        res.body.user.should.have.property('token');
        user = res.body.user
        done();
      });
    });
    it('Should send back an unauthorized error', function(done) {
      chai.request(server).post('/login').send(wrongPasswordUser).end(function (err, res) {
        res.should.have.status(401);
        done();
      });
    });
    it('Should send back a not found error', function(done) {
      chai.request(server).post('/login').send({user: 'aaron@test.com', password: 'hello123'}).end(function (err, res) {
        res.should.have.status(400);
        done();
      });
    });
  });

});

describe('Movie Tests', function() {
  const newMovie = {
    imagePoster: '',
    title: 'Testing Title',
    genre: 'Testing Genre',
    rating: '10',
    actors: 'Steve Martin, Collin Ferral, Leo Decaprio',
    year: '2017'
  }

  describe('Create Movie', function() {
    it('Should create a new movie with the API', function(done) {
      chai.request(server).post('/movie').set('Authorization', user.token).send(newMovie).end(function (err, res) {
        assert.equal(err, undefined)
        assert.equal(res.body.success, true)
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('movie');
        res.body.movie.should.have.property('title').eql("Testing Title");
        res.body.movie.should.have.property('genre').eql("Testing Genre");
        res.body.movie.should.have.property('rating').eql("10");
        res.body.movie.should.have.property('year').eql("2017");
        res.body.movie.should.have.property('actors').to.have.same.members("Steve Martin, Collin Ferral, Leo Decaprio");
        res.body.movie.should.have.property('uploadedByUser').eql(user._id);
        done();
      });
    });
  });

  describe('Get Movies', function() {
    it('Should send back a list of all movies', function(done) {
      chai.request(server).get('/movies').end(function (err, res) {
        assert.equal(err, undefined)
        assert.equal(res.body.success, true)
        res.should.have.status(200);
        res.body.movies.should.be.a('array');
        assert.equal(res.body.movies.length, 1)
        done();
      });
    });
  });

  describe('Update Movie', function() {
    it('Should update a movie', function() {

    });
  });

  describe('Delete Movie', function() {
    it('Should delete a movie given a valid movie id', function() {
      chai.request(server).delete('/movie/' + movie._id).set('Authorization', user.token).send(newMovie).end(function (err, res) {
        assert.equal(res.body.success, true)
        res.should.be.json;
        res.body.should.be.a('object');
        done();
      });
    });
    it('Should NOT delete a movie with an invalid movie id', function() {
      chai.request(server).put('/movie/' + 'xyz123%*').set('Authorization', user.token).send(newMovie).end(function (err, res) {
        assert.equal(res.body.success, true)
        assert.equal(res.body.error, true)
        res.should.be.json;
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.errors.pages.should.have.property('message').eql('Unable to locate that movie.');
        done();
      });
    });

  });
  
});