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
  random_email = (Math.random() + 1).toString(36).substring(9);
  
  const newUser = {
    email: random_email + `@gmail.com`,
    password: 'P455w0rd'
  }
  const User = {
    email: `coolguyaaron@gmail.com`,
    password: 'ASecretSoBigNoOneCanBreak'
  }
  const wrongPasswordUser = {
    email: `coolguyaaron@gmail.com`,
    password: 'password'
  }

  // Added random new user email here.  Would be better if users could be deleted after test
  // for clean up

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
      chai.request(server).post('/register').send(User).end(function (err, res) {
        assert.equal(err, undefined)
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
      chai.request(server).post('/login').send(User).end(function (err, res) {
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

    it('Should send back a user not found error', function(done) {
      chai.request(server).post('/login').send({user: 'aaron@test.com', password: 'hello123'}).end(function (err, res) {
        res.should.have.status(400);
        done();
      });
    });
  });
});

// come back and code these in with some logic after validating tests work
const usertoken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU5YzZjMTBmYjc2NzI2MTI4ODFlODFlMCJ9.44z4qc9B3TcZQxOlGQzzdCN78elta9pF3myPXhhIHjw'
const userid = '59c6c10fb7672612881e81e0'
const movieid = '59c6c111b7672612881e81e1'
const imagePoster = 'http://127.0.0.1'
const title = 'Bladerunner'
const genre = 'Science Fiction'
const rating = '11'
const actors = 'Harrison Ford'
const year = '1982'

describe('Movie Tests', function() {
  const newMovie = {
    imagePoster: '',
    title: 'Testing Title',
    genre: 'Testing Genre',
    rating: '10',
    actors: 'Steve Martin,Collin Ferral,Leo Decaprio',
    year: '2017'
  }


  describe('Create Movie', function() {
    it('Should create a new movie with the API', function(done) {
      chai.request(server).post('/movie').set('Authorization', usertoken).send(newMovie).end(function (err, res) {
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
        res.body.movie.should.have.property('actors').eql(['Steve Martin', 'Collin Ferral', 'Leo Decaprio']);
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
        done();
      });
    });

    //I am not sure about this one. User story states "As a user I want to be able to search 
    //existing movies by an arbitrary field." - Genre Actors,Title,Year,Rating
    //More information would be added if it existed in the source code.
    it('Should send back a list of all movies queried by genre', function(done) {
      chai.request(server).get('/movies/genre' + genre).end(function (err, res) {
        assert.equal(err, undefined)
        assert.equal(res.body.success, true)
        res.should.have.status(200);
        res.body.movies.should.be.a('array');
        done();
      });
    });
    
    it('Should send back a list of all movies queried by actors', function(done) {
      chai.request(server).get('/movies/actors' + actors).end(function (err, res) {
        assert.equal(err, undefined)
        assert.equal(res.body.success, true)
        res.should.have.status(200);
        res.body.movies.should.be.a('array');
        done();
      });
    });

    it('Should send back a list of all movies queried by title', function(done) {
      chai.request(server).get('/movies/title' + title).end(function (err, res) {
        assert.equal(err, undefined)
        assert.equal(res.body.success, true)
        res.should.have.status(200);
        res.body.movies.should.be.a('array');
        done();
      });
    });

    it('Should send back a list of all movies queried by year', function(done) {
      chai.request(server).get('/movies/year' + year).end(function (err, res) {
        assert.equal(err, undefined)
        assert.equal(res.body.success, true)
        res.should.have.status(200);
        res.body.movies.should.be.a('array');
        done();
      });
    });

    it('Should send back a list of all movies queried by rating', function(done) {
      chai.request(server).get('/movies/rating' + rating).end(function (err, res) {
        assert.equal(err, undefined)
        assert.equal(res.body.success, true)
        res.should.have.status(200);
        res.body.movies.should.be.a('array');
        done();
      });
    });

  it('Should send back a list of all movies created by a specific User', function(done) {
      chai.request(server).get('/users/' + userid + '/movies').end(function (err, res) {
        assert.equal(err, undefined)
        assert.equal(res.body.success, true)
        res.should.have.status(200);
        res.body.movies.should.be.a('array');
        done();
      });
    });
  });

  

  describe('Update Movie', function() {
    it('Should update a movie given a valid movie id', function() {
      chai.request(server).put('/movie/' + movieid).set('Authorization', usertoken).send(newMovie).end(function (err, res) {
        assert.equal(err, undefined)
        assert.equal(res.body.success, true)
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('movie');
        res.body.movie.should.have.property('title').eql("Testing Title");
        res.body.movie.should.have.property('genre').eql("Testing Genre");
        res.body.movie.should.have.property('rating').eql("10");
        res.body.movie.should.have.property('year').eql("2015");
        res.body.movie.should.have.property('actors').to.have.same.members("Steve Martin,Collin Ferral,Leo Decaprio");
        res.body.movie.should.have.property('uploadedByUser').eql(user._id);
        done();
      });
    });

    it('Should NOT update any movie with an invalid movie id', function() {
      chai.request(server).put('/movie/' + '1NV4L1D').set('Authorization', usertoken).send(newMovie).end(function (err, res) {
        assert.equal(err, undefined)
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

  describe('Delete Movie', function() {
    it('Should delete a movie given a valid movie id', function() {
      chai.request(server).delete('/movie/' + movieid).set('Authorization', usertoken).send(newMovie).end(function (err, res) {
        assert.equal(res.body.success, true)
        res.should.be.json;
        res.should.have.status(200)
        res.body.should.be.json;
       // This needs to be coded with the message that is passed on successful completion
      res.body.errors.pages.should.have.property('message').eql('Movie Deleted.');
        done();
      });
    });

    it('Should NOT delete a movie with an invalid movie id', function() {
      chai.request(server).delete('/movie/' + '1NV4L1D').set('Authorization', usertoken).send(newMovie).end(function (err, res) {
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
