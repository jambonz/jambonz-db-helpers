const debug = require('debug')('jambonz:db-helpers');

const sql =
`SELECT *
FROM applications
WHERE application_sid = ?
`;

/**
 * Lookup the application by application_sid
 * @param {*} pool
 * @param {*} logger
 * @param {*} phoneNumber - phone number that was dialed
 */
async function lookupApplicationBySid(pool, logger, application_sid) {
  const pp = pool.promise();
  const [r] = await pp.execute(sql, [application_sid]);
  debug(`results: ${JSON.stringify(r)}`);
  return r.length > 0 ? r[0] : null;
}

module.exports = lookupApplicationBySid;
