const debug = require('debug')('jambonz:db-helpers');
const assert = require('assert');

const sqlRegex = 'SELECT regex, lcr_route_sid FROM lcr_routes ORDER BY priority ASC';
const sqlCarrierSet =
`SELECT lcs.voip_carrier_sid, vc.name, priority, workload
FROM lcr_carrier_set_entry lcs, voip_carriers vc
WHERE lcs.lcr_route_sid = ?
AND lcs.voip_carrier_sid = vc.voip_carrier_sid
ORDER by priority ASC`;
const sqlGateways =
`SELECT voip_carrier_sid, sip_gateway_sid, ipv4, port
FROM sip_gateways
WHERE is_active = 1
AND outbound = 1
AND voip_carrier_sid IN (?)`;

function performLcr(pool, logger, calledNumber) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      conn.query(sqlRegex, (err, results) => {
        if (err) return rejectAndRelease(conn, reject.bind(null, err));
        debug(`lcr results: ${JSON.stringify(results)}`);

        // if no lcr has been configured, do random selection of a gateway
        if (results.length === 0) {
          logger.debug('performLcr: lcr has not been configured, return random list of outbound gateways');
          return randomizeOutboundGateways(pool, logger);
        }

        // search for a matching regex
        const lcr_route = results.find((lcr) => RegExp(lcr.regex).test(calledNumber));
        if (!lcr_route) return rejectAndRelease(conn, reject.bind(null, new Error('no matching lcr route')));

        // retrieve the ordered list of carriers associated with that route
        conn.query(sqlCarrierSet, [lcr_route.lcr_route_sid], (err, carriers) => {
          if (err) return rejectAndRelease(conn, reject.bind(null, err));

          // retrieve the outbound sip gateways associated with the selected carriers
          const vcsids = carriers.map((o) => o.voip_carrier_sid);
          if (vcsids.length === 0) {
            return rejectAndRelease(conn,reject.bind(null, new Error('no configured gateways for lcr route')));
          }
          debug(`performLcr: voip_carrier_sids: ${JSON.stringify(vcsids)}`);
          conn.query(sqlGateways, [vcsids], (err, results) => {
            if (err) return rejectAndRelease(conn, reject.bind(null, err));

            // create a Map of carrier => [{ipv, port}] outbound gateways
            const gwMap = new Map();
            results.forEach((o) => {
              const vc_sid = o.voip_carrier_sid;
              if (!gwMap.has(vc_sid)) gwMap.set(vc_sid, []);
              gwMap.get(vc_sid).push(`${o.ipv4}:${o.port}`);
            });

            /*
              1. add gateways into each row
              2. stratify into layers by priority
              3. reduce each layer into an ordered list of gateways, by workload
              4. reduce all layers into a single ordered list of gateways
            */
            const fnGatewayInsert = addGateways.bind(null, gwMap);
            const gateways = stratifyByPriority(carriers.map(fnGatewayInsert))
              .map(orderGatewaysByWorkload)
              .reduce(appendGateways, []);

            debug(`performLcr: final list of gateways for ${calledNumber}: ${gateways}`);
            resolve(gateways);
          });
        });
      });
    });
  });
}

function rejectAndRelease(conn, fn) {
  conn.release();
  fn();
}

function addGateways(gwMap, obj) {
  obj.gateways = gwMap.get(obj.voip_carrier_sid);
  return obj;
}

function stratifyByPriority(carriers) {
  const layers = [];
  let priority = null;
  let start = 0;
  debug(`stratifyByPriority: input ${JSON.stringify(carriers)}`);
  carriers.forEach((c, idx) => {
    if (idx === 0) priority = c.priority;
    if (priority != c.priority) {
      layers.push(carriers.slice(start, idx));
      start = idx;
    }
  });
  layers.push(carriers.slice(start));
  debug(`stratifyByPriority: output ${JSON.stringify(layers)}`);
  return layers;
}

function orderGatewaysByWorkload(layer) {
  debug(`orderGatewaysByWorkload: input ${JSON.stringify(layer)}`);
  const total = layer.reduce((accum, c) => accum + c.workload, 0);

  // select one randomly based on desired workload
  const random = Math.random() * total;
  let mark = 0, selected = -1;
  const gateways = [];
  for (let i = 0; i < layer.length; i++) {
    if (selected === -1 && random <= (mark += layer[i].workload)) selected = i;
    else {
      gateways.push(layer[i].gateways);
    }
  }
  assert(selected >= 0);

  // put selected one at the front
  const result = [].concat(layer[selected].gateways, ...gateways);
  debug(`orderGatewaysByWorkload: output ${JSON.stringify(result)}`);
  return result;
}

function appendGateways(accum, arrGateways) {
  return accum.concat(arrGateways);
}

const sqlGatewaysAll =
`SELECT voip_carrier_sid, sip_gateway_sid, ipv4, port
FROM sip_gateways
WHERE is_active = 1
AND outbound = 1`;

async function randomizeOutboundGateways(pool, logger) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      conn.query(sqlGatewaysAll, (err, results) => {
        conn.release();
        if (err) return reject(err);
        resolve(shuffle(results.map((o) => `${o.ipv4}:${o.port}`)));
      });
    });
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
module.exports = performLcr;
