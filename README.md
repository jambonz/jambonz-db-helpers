# jambonz-db-helpers  [![Build Status](https://secure.travis-ci.org/jambonz/jambonz-db-helpers.png)](http://travis-ci.org/jambonz/jambonz-db-helpers)


A set of helper functions to access data in the [jambones database](https://github.com/jambonz/jambones-api-server/blob/master/db/jambones-sql.sql).

This module exposes a function that should be called with mysql [configuration options](https://www.npmjs.com/package/mysql#connection-options) and, optionally, a [pino](https://www.npmjs.com/package/pino) logger function.  It then returns an object containing various useful functions for accessing and updating the database.

```
const mySqlOpts = {
  "host": "localhost",
  "user": "jambones_test",
  "database": "jambones_test",
  "password": "jambones_test"
};
const logger = require('pino')();
const {lookupAuthHook} = require('jambonz-db-helpers')(mySqlOpts, logger);
// now invoke lookupAuthHook per below
```

### Functions

- [lookupAuthHook(sip_realm)](#lookupAuthHook) - retrieve the http authentication callback for a given sip domain 



#### lookupAuthHook

```
try {
  const obj = await lookupAuthHook('sip.example.com');
  // {url: 'http://mycallback.com:3000, auth: {username: 'foo', password: 'bar}}
  // where url is the callback url
  // and auth is optional - if provided it means the url is protected using basic auth
  // and the user/pass provided should be used
}
catch (err) {
  // throws if no callback is found for that domain
}
```