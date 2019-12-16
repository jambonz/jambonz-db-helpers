const debug = require('debug')('jambonz:db-helpers');

const sql =
`SELECT sg.sip_gateway_sid, sg.voip_carrier_sid, vc.name, sg.inbound, sg.outbound, sg.is_active 
FROM sip_gateways sg, voip_carriers vc
WHERE sg.voip_carrier_sid = vc.voip_carrier_sid
AND ipv4 = ? and port = ?
`;
function lookupSipGatewayBySignalingAddress(pool, logger, ipv4, port) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      conn.query(sql, [ipv4, port], (err, results) => {
        conn.release();
        if (err) return reject(err);
        debug(`results: ${JSON.stringify(results)}`);
        resolve(results.length === 1 ? results[0] : null);
      });
    });
  });
}

module.exports = lookupSipGatewayBySignalingAddress;
