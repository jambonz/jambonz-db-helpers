const mysql = require('mysql2');

module.exports = function(mysqlConfig, logger) {
  const pool = mysql.createPool(mysqlConfig);
  logger = logger || {info: () => {}, error: () => {}, debug: () => {}};
  pool.getConnection((err, conn) => {
    if (err) throw err;
    conn.ping((err) => {
      if (err) return logger.error(err, `Error pinging mysql at ${JSON.stringify(mysqlConfig)}`);
    });
  });

  return {
    lookupAuthHook: require('./lib/lookup-auth-hook').bind(null, pool, logger),
    lookupSipGatewayBySignalingAddress: require('./lib/lookup-sip-gateway-by-signaling-address').bind(null, pool, logger),
    performLcr: require('./lib/perform-lcr').bind(null, pool, logger),
    lookupAppByPhoneNumber: require('./lib/lookup-app-by-phone-number').bind(null, pool, logger),
    lookupApplicationBySid: require('./lib/lookup-application-by-sid').bind(null, pool, logger)
  };
};
