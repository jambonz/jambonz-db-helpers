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

/**
 * Search for authentication webhook first at the account level, by sip domain / realm,
 * if not found then search at the service provider level by root domain
 * @param {*} pool - database pool
 * @param {*} logger - pino logger
 * @param {*} sipRealm - sip realm/domain to search for
 */
async function lookupAuthHook(pool, logger, sipRealm) {
  const pp = pool.promise();
  const [r] = await pp.execute('SELECT * from accounts WHERE sip_realm = ?', [sipRealm]);
  debug(`results from querying account for sip realm ${sipRealm}: ${JSON.stringify(r)}`);
  if (r.length > 0 && r[0].registration_hook) {
    return prepareResults(r);
  }
  const arr = /([^\.]+\.[^\.]+)$/.exec(sipRealm);
  if (!arr) return null;

  const rootDomain = arr[1];
  logger.debug(`did not find hook at account level, checking service provider for ${rootDomain}`);
  const [r2] = await pp.execute('SELECT * from service_providers WHERE root_domain = ?', [rootDomain]);
  debug(`results from querying service_providers for root domain ${rootDomain}: ${JSON.stringify(r2)}`);
  if (r2.length > 0 && r2[0].registration_hook) {
    return prepareResults(r2);
  }
  return null;
}

module.exports = lookupAuthHook;
