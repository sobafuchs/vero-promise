var superagent = require('superagent');

module.exports = (function vero(authToken) {
  var apiBase = 'https://api.getvero.com/api/v2';
  var acceptHeader = 'application/json';
  var authToken = authToken || false;
  var vero = {};

  vero.heartbeat = function heartbeat(cb) {
    return new Promise(function(resolve, reject) {
      superagent
        .get(apiBase + '/heartbeat')
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(cb ? cb(res) : res);
        });
    });
  };

  vero.trackUser = function trackUser(id, email, data, cb) {
    return new Promise(function(resolve, reject) {
      superagent
        .post(apiBase + '/users/track')
        .send({
          id: id,
          email: email,
          data: data || {},
          auth_token: authToken
        })
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(cb ? cb(res) : res);
        });
    });
  };

  vero.trackMultipleUsers = function trackMultipleUsers(users, cb) {
    return new Promise(function(resolve, reject) {
      if (!users || !Array.isArray(users)) {
        return reject(new Error('Invalid type passed in as parameters: must be array'));
      }
      if (!users.length) {
        return reject(new Error('Users array is empty'));
      }

      var promises = [];
      for (var i = 0; i < users.length; i++) {
        var payload = {
          id: users[i].id,
          email: users[i].email,
          data: users[i].data || {},
          auth_token: authToken
        };

        promises[i] = new Promise(function(resolve, reject) {
          superagent
            .post(apiBase + '/users/track')
            .send(payload)
            .accept(acceptHeader)
            .end(function(err, res) {
              if (err) return reject(err);
            })
        });
      }

      return Promise.all(promises);
    });
  };

  vero.reidentify = function reidentify(oldId, newId, cb) {
    return new Promise(function(resolve, reject) {
      superagent
        .put(apiBase + '/users/reidentify')
        .send({
          auth_token: authToken,
          id: oldId,
          new_id: newId
        })
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(cb ? cb(res) : res);
        });
    });
  };

  vero.unsubscribe = function unsubscribe(id, cb) {
    return new Promise(function(resolve, reject) {
      superagent
        .post(apiBase + '/users/unsubscribe')
        .send({
          auth_token: authToken,
          id: id
        })
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(cb ? cb(res) : res);
        });
    });
  };

  vero.resubscribe = function resubscribe(id, cb) {
    return new Promise(function(resolve, reject) {
      superagent
        .post(apiBase + '/users/resubscribe')
        .send({
          auth_token: authToken,
          id: id
        })
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(cb ? cb(res) : res);
        });
    });
  };

  vero.deleteUser = function(id, cb) {
    return new Promise(function(resolve, reject) {
      superagent
        .del(apiBase + '/users/delete')
        .send({
          auth_token: authToken,
          id: id
        })
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(cb ? cb(res) : res);
        });
    });
  };

  vero.addTags = function(id, tags, cb) {
    return new Promise(function(resolve, reject) {
      if (typeof tags === 'string') {
        tags = [tags];
      } else if (!tags || !Array.isArray(tags)) {
        reject(new Error('tags must be a string or array'));
      }
      superagent
        .put(apiBase + '/users/tags/edit')
        .send({
          auth_token: authToken,
          id: id,
          add: tags,
          remove: []
        })
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(cb ? cb(res) : res);
        })
    });
  };

  vero.removeTags = function removeTags(id, tags, cb) {
    return new Promise(function(resolve, reject) {
      if (typeof tags === 'string') {
        tags = [tags];
      } else if (!tags || !Array.isArray(tags)) {
        reject(new Error('tags must be a string or array'));
      }

      superagent
        .put(apiBase + '/users/tags/edit')
        .send({
          auth_token: authToken,
          id: id,
          add: [],
          remove: tags
        })
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(cb ? cb(res) : res);
        });
    });
  };

  vero.addAndRemoveTags = function addAndRemoveTags(id, add, remove, cb) {
    return new Promise(function(resolve, reject) {
      if (typeof add === 'string') {
        add = [add];
      } else if (typeof remove === 'string') {
        remove = [remove];
      }

      superagent
        .put(apiBase + '/users/tags/edit')
        .send({
          auth_token: authToken,
          id: id,
          add: add,
          remove: remove
        })
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(cb ? cb(res) : res);
        });
    });
  }

  vero.trackEvent = function trackEvent(id, email, eventName, eventData, cb) {
    return new Promise(function(resolve, reject) {
      superagent
        .post(apiBase + '/events/track')
        .send({
          auth_token: authToken,
          identity: {id: id, email: email},
          event_name: eventName,
          data: eventData
        })
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(cb ? cb(res) : res);
        });
    });
  };

  vero.trackOneEventForMany = function trackOneEventForMany(idsAndEmails, eventName, eventData) {
    return new Promise(function(resolve, reject) {
      if (!idsAndEmails || !Array.isArray(idsAndEmails)) {
        return reject(new Error('trackOneEventForMany requires an array as its first paramter'));
      }
      if (!idsAndEmails.length) {
        return reject(new Error('Array of userIds and emails is empty'));
      }

      var promises = [];
      for (var i = 0; i < idsAndEmails.length; i++) {
        if (!idsAndEmails[i].id) {
          return reject(new Error('trackOneEventForMany requires each user to have an id'));
        }
        var payload = {
          auth_token: authToken,
          identity: {id: idsAndEmails[i].id, email: idsAndEmails[i].email},
          event_name: eventName,
          data: eventData
        };

        promises[i] = new Promise(function(resolve, reject) {
          superagent
            .post(apiBase + '/events/track')
            .send(payload)
            .accept(acceptHeader)
            .end(function(err, res) {
              if (err) return reject(err);
              return resolve(res);
            });
        });
      };

      return resolve(Promise.all(promises));
    });
  };

  vero.trackMultipleEvents = function trackMultipleEvents(id, email, events, cb) {
    return new Promise(function(resolve, reject) {
      if (!events || !Array.isArray(events)) {
        return reject(new Error('events must be an array of objects'));
      }

      var promises = [];
      for (var i = 0; i < events.length; i++) {
        var payload = {
          auth_token: authToken,
          identity: {id: id, email: email},
          event_name: events[i].name,
          data: events[i].data
        };

        promises[i] = new Promise(function(resolve, reject) {
          superagent
          .post(apiBase + '/events/track')
          .send(payload)
          .accept(acceptHeader);
        });
      };
      return Promise.all(promises);
    })
  };

  vero.createUserAndTrackEvent = function createUserAndTrackEvent(id, email, userData, eventName, eventData) {
    var p1 = new Promise(function(resolve, reject) {
      superagent
        .post(apiBase + '/users/track')
        .send({
          auth_token: authToken,
          id: id,
          email: email,
          data: userData || {}
        })
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(res);
        });
    });
    var p2 = new Promise(function(resolve, reject) {
      superagent
        .post(apiBase + '/events/track')
        .send({
          auth_token: authToken,
          identity: {id: id, email: email},
          event_name: eventName,
          data: eventData || {}
        })
        .accept(acceptHeader)
        .end(function(err, res) {
          if (err) return reject(err);
          return resolve(res);
        });
    });

    return Promise.all([p1, p2]);
  };

  return vero;
});
