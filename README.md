# vero-promise
This is a wrapper for Vero's public API based on promises and `superagent`

Simply...

1. `npm install vero-promise` or `git clone` the repository or download the zip file. All the relevant code is in `index.js`.
2. `index.js` returns a function that takes your `auth_token` as a parameter. To use the library, you'll need to do something like this:

```
// vero.js
var vero = require('vero-promise');

module.exports = vero(yourAuthToken);
```

Then, when you need to use vero:

```
var vero = require('vero');

vero.trackUser('randomId', 'randomEmail', {firstName: 'gandalf'})
  .then(function(res) {
    // rest of your code
  })
  .catch(function(error) {
    // do whatever with what the promise rejected with
  });

```

If you are using ES6 and are using `co`, you won't even need to use `.then` since `co` automatically unravels promises.

```
co(function*() {
  let response = yield vero.trackUser('randomId', 'randomEmail', {firstName: 'gandalf'});
  assert.ok(response.ok);
})
.catch(function(error) {
  // handle rejection
});
```

3.To run the tests, either create a `config.js` file and create a vero instance with your auth token, or edit the part in `test.js` where vero is required in and pass in the auth token there. Then, run `npm install` and `npm test`.

Feel free to reach out if you have any questions or find any bugs.
