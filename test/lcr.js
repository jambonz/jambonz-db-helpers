const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('sip gateways tests', async(t) => {
  const fn = require('..');
  const {performLcr} = fn(mysqlOpts);
  try {
    let carriers = await performLcr('4412838238238');
    //console.log(`carriers: ${JSON.stringify(carriers)}`);
    t.ok(carriers[0].voip_carrier_sid === '287c1452-620d-4195-9f19-c9814ef90d78', 'retrieves carriers matching regex');

    carriers = await performLcr('16172375089');
    //console.log(`carriers: ${JSON.stringify(carriers)}`);
    t.ok(carriers.length === 0, 'retrieves empty set when no carriers have been configured for a route');

    try {
      carriers = await performLcr('3383904905');
      t.fail('should throw on no match');
    }
    catch (err) {
      t.ok(err.message === 'no matching lcr route', 'throws \'no matching lcr route\' when called number does not match anything');
    }

    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

