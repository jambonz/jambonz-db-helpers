const test = require('tape').test ;
const config = require('config');
const mysqlOpts = config.get('mysql');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

test('phone numbers tests', async(t) => {
  const fn = require('..');
  const {lookupAppByPhoneNumber, lookupApplicationBySid, lookupAccountBySid} = fn(mysqlOpts);
  try {
    let app = await lookupAppByPhoneNumber('15083084809');
    //console.log(`app: ${JSON.stringify(app)}`);
    t.ok(app !== null, 'retrieves application for phone number');

    app = await lookupApplicationBySid('3b43e39f-4346-4218-8434-a53130e8be49');
    t.ok(app !== null, 'retrieves application by sid');
    
    let account = lookupAccountBySid('422affb5-4d1e-45e8-b2a4-2623f08b95ef');
    t.ok(account !== null, 'retrieves account by sid');

    t.end();
  }
  catch (err) {
    t.end(err);
  }
});

