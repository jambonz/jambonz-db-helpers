const mysql = require('mysql');

module.exports = function(mysqlConfig, logger) {
  const pool = mysql.createPool(mysqlConfig);
  logger = logger || {info: () => {}, error: () => {}, debug: () => {}};
  pool.getConnection((err, conn) => {
    if (err) throw err;
    conn.ping((err) => {
      if (err) return logger.error(err, `Error pinging mysql at ${JSON.stringify(mysqlConfig)}`);
    });
  });
  const fnHook = require('./lib/lookup-auth-hook');
  //console.log(`fnHook: ${typeof fnHook}`);
  return {
    lookupAuthHook: fnHook.bind(null, pool, logger)
  };
};
