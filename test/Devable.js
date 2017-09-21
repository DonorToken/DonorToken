'use strict';
const assertJump = require('./helpers/assertJump');

var Devable = artifacts.require('Devable');

contract('Devable', function(accounts) {
  let contract;
  let dev;

  beforeEach(async function() {
    contract = await Devable.new();
    dev = await contract.dev();
  });

  it('should have dev', async function() {
    assert.isTrue(dev !== 0);
  });

  it('changes dev after transfer', async function() {
    let other = accounts[1];
    await contract.transferDevship(other);
    let devNew = await contract.dev();

    assert.isTrue(devNew === other);
  });

  it('should prevent non-devs from transfering', async function() {
    const other = accounts[2];
    assert.isTrue(dev !== other);
    try {
      await contract.transferDevship(other, {from: other});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  it('should guard devship against stuck state', async function() {
    try {
      await contract.transferDevship(null, {from: dev});
      assert.fail();
    } catch(error) {
      assertJump(error);
    }
  });

});