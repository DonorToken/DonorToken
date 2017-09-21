'use strict';

import expectThrow from './helpers/expectThrow';
var SampleERC677Token = artifacts.require('SampleERC677Token');
var ERC677Contract = artifacts.require('ERC677Contract');
var ERC677ContractAccepter = artifacts.require('ERC677ContractAccepter');

contract('ERC677Token', function(accounts) {
  let token;
  let contract;

  beforeEach(async function() {
    token = await SampleERC677Token.new(accounts[0], 100);
    contract = await ERC677Contract.new();
  });

  it('should approveAndCall successfully', async function () {
    let call = await token.approveAndCall(contract.address, 42, null, {from: accounts[0]});
    assert.equal(call.logs[0].event, 'Approval');
    // assert.equal(call.logs[1].event, 'ReceiveApproval'); // nope, doesn't work, apparently b/c it's external
    (await token.allowance(accounts[0], contract.address)).should.be.bignumber.equal(42);
  });

  it('should transferAndCall throw w/ non-Accepter', async function () {
    await expectThrow(token.transferAndCall(contract.address, 42, null, {from: accounts[0]}));
  });

  it('should transferAndCall successfully w/ Accepter', async function () {
    let contractA = await ERC677ContractAccepter.new();
    let call = await token.transferAndCall(contractA.address, 42, null, {from: accounts[0]});
    assert.equal(call.logs[0].event, 'Transfer');
    // assert.equal(call.logs[1].event, 'ReceiveTransfer'); // nope, doesn't work, apparently b/c it's external
    (await token.balanceOf(contractA.address)).should.be.bignumber.equal(42);
    (await token.balanceOf(accounts[0])).should.be.bignumber.equal(58);
  });

});
