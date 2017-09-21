'use strict';
const assertJump = require('./helpers/assertJump');

var Benable = artifacts.require('Benable');

contract('Benable', function(accounts) {
  let contract;
  let ben;

  beforeEach(async function() {
    contract = await Benable.new();
    ben = await contract.ben();
  });

  it('should have ben', async function() {
    assert.isTrue(ben !== 0);
  });

  it('changes ben after transfer', async function() {
    let other = accounts[1];
    await contract.transferBenship(other);
    let benNew = await contract.ben();

    assert.isTrue(benNew === other);
  });

  it('should prevent non-bens from transfering', async function() {
    const other = accounts[2];
    assert.isTrue(ben !== other);
    try {
      await contract.transferBenship(other, {from: other});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  it('should guard benship against stuck state', async function() {
    try {
      await contract.transferBenship(null, {from: ben});
      assert.fail();
    } catch(error) {
      assertJump(error);
    }
  });

});