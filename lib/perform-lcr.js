const debug = require('debug')('jambonz:db-helpers');

const sqlRegex = 'SELECT regex, lcr_route_sid FROM lcr_routes ORDER BY priority ASC';
const sqlCarrierSet =
`SELECT lcs.voip_carrier_sid, vc.name, priority, workload
FROM lcr_carrier_set_entry lcs, voip_carriers vc
WHERE lcs.lcr_route_sid = ?
AND lcs.voip_carrier_sid = vc.voip_carrier_sid
ORDER by priority ASC`;

function performLcr(pool, logger, calledNumber) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      conn.query(sqlRegex, (err, results) => {
        conn.release();
        if (err) return reject(err);
        debug(`lcr results: ${JSON.stringify(results)}`);

        // if no lcr has been configured, do random selection of a gateway
        if (results.length === 0) return reject(new Error('no configured lcr routes'));

        // search for a matching regex
        const lcr_route = results.find((lcr) => RegExp(lcr.regex).test(calledNumber));
        if (!lcr_route) return reject(new Error('no matching lcr route'));

        // retrieve the ordered list of carriers associated with that route
        pool.getConnection((err, conn) => {
          if (err) return reject(err);
          conn.query(sqlCarrierSet, [lcr_route.lcr_route_sid], (err, results) => {
            conn.release();
            if (err) return reject(err);
            resolve(results);
          });
        });
      });
    });
  });
}

module.exports = performLcr;
