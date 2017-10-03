'use strict';

import expectThrow from './helpers/expectThrow';
var SampleERC23Token = artifacts.require('SampleERC23Token');

contract('ERC23Token', function(accounts) {
  let token;

  beforeEach(async function() {
    token = await SampleERC23Token.new(accounts[0], 100);
  });

  it("should return correct balances after transfer", async function(){
    let transfer = await token.transfer(accounts[1], 100);

    let firstAccountBalance = await token.balanceOf(accounts[0]);
    assert.equal(firstAccountBalance, 0);

    let secondAccountBalance = await token.balanceOf(accounts[1]);
    assert.equal(secondAccountBalance, 100);

    // ERC23Token tests
    assert.equal(transfer.logs[0].event, 'Transfer');
    assert.equal(transfer.logs[0].args.from.valueOf(), accounts[0]);
    assert.equal(Object.keys(transfer.logs[0].args).length, 4);
  });

});
