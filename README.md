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
HTTP authentication callbacks are configured in the `accounts` table (`accounts.sip_realm`).  Furthermore if no exact match is found in the accounts table for a given sip realm, then a callback can be configured for the root domain in the `service_providers.root_domain` column.  

This function is used by telephony apps that need to challenge incoming SIP requests, and therefore need to select the correct customer callback hook to delegate authentication to.
```
try {
  const obj = await lookupAuthHook('sip.example.com');
  // {url: 'http://mycallback.com:3000, auth: {username: 'foo', password: 'bar}}
  // where obj.url is the callback url
  // and obj.auth is optional - if provided it means the url is protected using http basic auth
  // and the user/pass provided should be used when invoking it.
}
catch (err) {
  // throws 'unknown sip realm' if no callback is found for that domain
}
```