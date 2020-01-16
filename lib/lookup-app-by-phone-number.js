const lookupApplicationBySid = require('./lookup-application-by-sid');
const debug = require('debug')('jambonz:db-helpers');

const sql =
`SELECT app.application_sid, app.name, app.account_sid, app.call_hook, app.call_status_hook,
app.hook_basic_auth_user, app.hook_basic_auth_password, app.hook_http_method
FROM applications app, phone_numbers ph
WHERE ph.number = ?
AND ph.application_sid = app.application_sid
`;
const sqlCallRoutes =
`SELECT cr.regex, cr.application_sid
FROM call_routes cr, phone_numbers ph
WHERE ph.number = ?
AND ph.account_sid = cr.account_sid
ORDER BY cr.priority ASC
`;

/**
 * Lookup the application which should be invoked when a call arrives on a phone number
 * @param {*} pool
 * @param {*} logger
 * @param {*} phoneNumber - phone number that was dialed
 */
async function lookupAppByPhoneNumber(pool, logger, phoneNumber) {
  const pp = pool.promise();

  // first see if the phone number is directly assigned to an app
  const [r] = await pp.execute(sql, [phoneNumber]);
  debug(`results from querying phone_numbers for application: ${JSON.stringify(r)}`);
  if (r.length > 0) {
    return r[0];
  }

  // if not, check the regex patterns that have been set up
  // for the account that owns the phone number
  const [callRoutes] = await pp.execute(sqlCallRoutes, [phoneNumber]);
  const selectedRoute = callRoutes.find((cr) => RegExp(cr.RegExp).test(phoneNumber));
  if (!selectedRoute) return null;

  return await lookupApplicationBySid(selectedRoute.application_sid);
}

module.exports = lookupAppByPhoneNumber;
