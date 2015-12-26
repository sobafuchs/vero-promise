'use strict';

const status = require('http-status');
const co = require('co');
const superagent = require('superagent');
const assert = require('assert');
const vero = require('./config')();

describe('vero-promise', function() {
  describe('heartbeat', function() {
    it('heartbeat w/o cb', function(done) {
      co(function*() {
        let res = yield vero.heartbeat();
        assert.ok(res.ok);
        done();
      }).catch(error => done(error));
    });

    it('heartbeat w/ cb', function(done) {
      co(function*() {
        var testCb = function(res) {
          assert.ok(res.ok);
        }
        let res = yield vero.heartbeat(testCb);
        done();
      }).catch(error => done(error));
    });
  });

  describe('users', function() {
    it('identifies a user', function(done) {
      var data = {
        firstName: 'billy',
        lastName: 'bob',
        favoriteLizard: 'kimodo dragon'
      };

      vero.trackUser('cheese', 'cheese@sixplus.com', data)
        .then(function(res) {
          assert.ok(res.ok);
          done();
        }).
        then(null, err => done(err));
    });

    it('identifies a user with cb', function(done) {
      var ok = function(res) {
        assert.ok(res.ok);
        done();
      }
      var data = {
        firstName: 'billy',
        lastName: 'bob',
        favoriteLizard: 'kimodo dragon'
      };

      vero.trackUser('cheese', 'cheese@sixplus.com', data, ok)
        .then(null, err => done(err));
    })

    it('errors if id or email is not provided', function(done) {
      var data = {
        firstName: 'billy',
        lastName: 'bob',
        favoriteLizard: 'kimodo dragon'
      };

      vero.trackUser(null, null, data)
        .then(function() {
          done(new Error('should have errored!'));
        })
        .then(null, function(err) {
          var res = err.response;
          assert.ok(res.badRequest);
          done();
        });
    });

    it('trackUser updates a user except for the user\'s id', function(done) {
      vero.trackUser('cheese', 'pwned@sixplus.com', {firstName: 'asdf'})
        .then(function(res) {
          assert.ok(res.ok);
          done();
        })
        .then(null, err => done(err));
    });

    it('updates a users id through the reidentify method', function(done) {
      vero.reidentify('cheese', 'apple')
        .then(function(res) {
          assert.ok(res.ok);
          done();
        })
        .then(null, err => done(err));
    });

    it('updates a users email through trackUser', function(done) {
      vero.trackUser('apple', 'd3stroyed@sixplus.com', {firstName: 'd3stroyed'})
        .then(function(res) {
          assert.ok(res.ok);
          done();
        })
    });

    it('deletes a user', function(done) {
      vero.deleteUser('apple')
        .then(function(res) {
          assert.ok(res.ok);
          done();
        })
    });

    it('adds a single tag as a string', function(done) {
      var data = {
        firstName: 'billy',
        lastName: 'bob',
        favoriteLizard: 'kimodo dragon'
      };
      var testId = 'testtag';
      vero.trackUser(testId, 'testTag@sixplus.com', data)
      .then(function() {
        var tag = 'chicken';

        return vero.addTags(testId, tag)
      })
      .then(function(res) {
        assert.ok(res.ok);
        done();
      })
      .then(null, function(err) {
        done(err);
      });
    });

    it('adds multiple tags as an array', function(done) {
      var testId = 'testtag';
      vero.addTags(testId, ['apple', 'cheese', 'water'])
        .then(function(res) {
          assert.ok(res.ok);
          done();
        })
        .then(null, function(err) {
          done(err);
        });
    });

    it('removes a single string tag', function(done) {
      var testId = 'testtag';
      vero.removeTags(testId, 'apple')
        .then(function(res) {
          assert.ok(res.ok);
          done();
        })
        .then(null, function(err) {
          done(err);
        });
    });

    it('removes multiple tags', function(done) {
      var testId = 'testtag';
      vero.removeTags(testId, ['water, cheese'])
        .then(function(res) {
          assert.ok(res.ok);
          done();
        })
        .then(null, function(err) {
          done(err);
        });
    });
  });

  describe('events', function() {
    it('tracks an event', function(done) {
      this.timeout(2000);
      vero.trackEvent('testtag', 'testtag@sixplus.com', 'new-user-signup')
        .then(function(res) {
          assert.ok(res.ok);
          done();
        })
        .then(null, function(err) {
          console.error(err);
          done(err);
        });
    });

    it('tracks multiple events', function(done) {
      var events = [
        {name: 'new-user-signup', data: {first: 'booglie', last: 'googlie'}},
        {name: 'eat-a-tomato', data: {color: 'red', vine: 'ripe'}},
        {name: 'you-shall-not-pass', data: {reason: 'balrog', fly: 'you fools'}},
        {name: 'mango', data: {color: 'orangeish-green'}}
      ];

      vero.trackMultipleEvents('testevents', 'testevents@bookalokal.com', events)
        .then(function(res) {
          assert.ok(res.ok);
          done();
        })
        .then(null, function(err) {
          done(err);
        });
    });

    it('tracks multiple users', function(done) {
      var users = [
        {id: 'id1', email: 'id1@sixplus.com'},
        {id: 'id2', email: 'id2@sixplus.com', data: {name: 'id2'}},
        {id: 'id3', email: 'id3@sixplus.com', data: {name: 'id3'}}
      ];

      vero.trackMultipleUsers(users)
        .then(function(res) {
          assert.ok(res.ok);
          done();
        })
        .then(null, function(err) {
          done(err);
        });
    });
  });

});
