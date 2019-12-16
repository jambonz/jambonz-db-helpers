const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('lcr tests', async(t) => {
  const fn = require('..');
  const {performLcr} = fn(mysqlOpts);
  try {
    let gateways = await performLcr('4412838238238');
    //console.log(`gateways: ${JSON.stringify(gateways)}`);
    t.ok(gateways[0] === '3.3.3.3:5060', 'uses lcr when regex matches');

    try {
      gateways = await performLcr('16172375089');
      t.fail('should throw on LCR route with no configured gateways')
    } catch (err) {
      t.ok(err.message === 'no configured gateways for lcr route', 'throws when no configured gateways for lcr route');
    }

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

