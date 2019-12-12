const debug = require('debug')('jambonz:db-helpers');

function prepareResults(results) {
  const obj = {url: results[0].registration_hook};
  if (results[0].hook_basic_auth_user && results[0].hook_basic_auth_password) {
    Object.assign(obj, {
      auth: {
        username: results[0].hook_basic_auth_user,
        password: results[0].hook_basic_auth_password
      }
    });
  }
  return obj;
}

function lookupAuthHook(pool, logger, sipRealm) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      conn.query('SELECT * from accounts WHERE sip_realm = ?', sipRealm, (err, results) => {
        conn.release();
        if (err) return reject(err);
        debug(`results from querying account for sip realm ${sipRealm}: ${JSON.stringify(results)}`);
        if (results.length > 0 && results[0].registration_hook) {
          return resolve(prepareResults(results));
        }

        /* search for a root domain in the service_provider table */
        const arr = /([^\.]+\.[^\.]+)$/.exec(sipRealm);
        //console.log(`arr: ${JSON.stringify(arr)}`);
        if (!arr) return resolve(null);
        const rootDomain = arr[1];
        logger.debug(`did not find hook at account level, checking service provider for ${rootDomain}`);
        pool.getConnection((err, conn) => {
          if (err) return reject(err);
          conn.query('SELECT * from service_providers WHERE root_domain = ?', rootDomain, (err, results) => {
            conn.release();
            debug(`results from querying service_providers for root domain ${rootDomain}: ${JSON.stringify(results)}`);
            if (err) return reject(err);
            if (results.length > 0 && results[0].registration_hook) {
              return resolve(prepareResults(results));
            }
            resolve(null);
          });
        });
      });
    });
  });
}

module.exports = lookupAuthHook;
