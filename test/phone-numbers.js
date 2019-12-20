const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('phone numbers tests', async(t) => {
  const fn = require('..');
  const {lookupAppByPhoneNumber} = fn(mysqlOpts);
  try {
    let app = await lookupAppByPhoneNumber('15083084809');
    console.log(`app: ${JSON.stringify(app)}`);
    t.ok(app !== null, 'retrieves application for phone number');

    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

