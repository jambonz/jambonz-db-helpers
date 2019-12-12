function lookupSipGatewayBySignalingAddress(pool, logger, ipv4, port) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      conn.query('SELECT * from sip_gateways WHERE ipv4 = ? and port = ?', [ipv4, port], (err, results) => {
        conn.release();
        if (err) return reject(err);
        resolve(results.length === 1 ? results[0]: null);
      });
    });
  });
}

module.exports = lookupSipGatewayBySignalingAddress;
