# jambonz-db-helpers  [![Build Status](https://secure.travis-ci.org/jambonz/jambones-db-helpers.png)](http://travis-ci.org/jambonz/jambones-db-helpers)


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

lookupAuthHook('sip.example.com')
  .then((obj) => {
    if (!obj) console.log('no authentication callback found for sip.example.com');
    else {
      console.log(JSON.stringify(obj));
      /*
      {
        url: 'http://auth.example.com:3000,
        auth: {
          username: 'foo',
          password: 'bar'
        }
      }
      */
    }
    )
  .catch((err) => {
    logger.error(err);
  }
});
```