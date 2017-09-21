import BigNumberInt from './helpers-my/BigNumberInt'
import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMThrow from './helpers/EVMThrow'

const BigNumber = web3.BigNumber;
const toWei = web3.toWei;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MDTCrowdsale = artifacts.require('MDTCrowdsale');
const MDToken = artifacts.require('MDToken');

contract('MDTCrowdsale', function ([owner, wallet2, investor]) {

  let RATE; // = new BigNumber(toWei(1, 'szabo'));
  let CAP; // = ether(1000000);
  let dev;
  let ben;

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock()
  })

  beforeEach(async function () {
    this.token = await MDToken.new();
    this.crowdsale = await MDTCrowdsale.new(this.token.address);
    this.token.transferOwnership(this.crowdsale.address); // give the token to this contract

    this.startTime = await this.crowdsale.startTime();
    this.endTime = await this.crowdsale.endTime();
    this.afterEndTime = this.endTime + duration.seconds(1);
    RATE = await this.crowdsale.rate();
    CAP = await this.crowdsale.cap();
    dev = (await this.crowdsale.dev());
    ben = (await this.crowdsale.ben());
  });

  
  it('should create crowdsale with correct parameters', async function () {
    this.crowdsale.should.exist;
    this.token.should.exist;

    (await this.crowdsale.startTime()).should.be.bignumber.equal(this.startTime);
    (await this.crowdsale.endTime()).should.be.bignumber.equal(this.endTime);
    (await this.crowdsale.rate()).should.be.bignumber.equal(RATE);
    (await this.crowdsale.wallet()).should.be.equal(ben);
  });

  it('should reject invalid (sub-rate) donations', async function () {
    const secsAfterLaunch = 3600;
    await increaseTimeTo(this.startTime + secsAfterLaunch);
    await this.crowdsale.sendTransaction({value: (RATE - 1), from: investor}).should.be.rejectedWith(EVMThrow);
    await this.crowdsale.sendTransaction({value: RATE, from: investor}).should.be.fulfilled;
  });

  it('should accept payments during the sale, send proceeds & any bonus tokens to donee/dev', async function () {
    const secsAfterLaunch = 3600;
    const investmentAmount = ether(1);
    let expectedTokenAmount = (investmentAmount.div(RATE));
    let ebp = (await this.crowdsale.EARLYBIRD_PERIOD());
    let bonusEarlybird = expectedTokenAmount.mul( BigNumberInt(ebp.sub(secsAfterLaunch).div(duration.days(1))).div(100) );
    let bonusWhale = BigNumberInt(investmentAmount.div(await this.crowdsale.BONUS_THRESHOLD()).mul(await this.crowdsale.BONUS_TOKEN_RATE())).div(RATE);
    expectedTokenAmount = expectedTokenAmount.add(bonusEarlybird).add(bonusWhale);
    const expectedTokenAmountDD = investmentAmount.div(await this.crowdsale.DONEE_TOKEN_THRESHOLD());

    await increaseTimeTo(this.startTime.add(secsAfterLaunch));
    // sendTransaction() invokes fallback() => buyTokens()
    await this.crowdsale.sendTransaction({value: investmentAmount, from: investor}).should.be.fulfilled;
    // await this.crowdsale.buyTokens(investor, {value: investmentAmount, from: investor}).should.be.fulfilled;

    (await this.token.balanceOf(investor)).should.be.bignumber.equal(expectedTokenAmount);
    (await this.token.totalSupply()).should.be.bignumber.equal(expectedTokenAmount.add(expectedTokenAmountDD.mul(2)));

    (await web3.eth.getBalance(this.crowdsale.address).should.be.bignumber.equal(0));

    const wallet = (await this.crowdsale.wallet());
    (await this.token.balanceOf(wallet)).should.be.bignumber.equal(expectedTokenAmountDD);
    (await this.token.balanceOf(dev)).should.be.bignumber.equal(expectedTokenAmountDD);
  });

  it('should allow transferBenship, and reject invalid attempts', async function () {
    await this.crowdsale.transferBenship(investor).should.be.rejectedWith(EVMThrow);
    await this.crowdsale.transferBenship(investor, {from: ben});
    (await this.crowdsale.ben()).should.be.equal(investor);
    (await this.crowdsale.wallet()).should.be.equal(investor);
  });

  it('should allow transferDevship, and reject invalid attempts', async function () {
    await this.crowdsale.transferDevship(investor);
    (await this.crowdsale.dev()).should.be.equal(investor);
    await this.crowdsale.transferDevship(owner).should.be.rejectedWith(EVMThrow);
  });

  it('should receive ERC20/standard tokens via approve, and allow tokenSweep to dev', async function () {
    const MintableToken = artifacts.require('MintableToken');
    let token = await MintableToken.new();
    const result = await token.mint(investor, 100);
    await token.approve(this.crowdsale.address, 42, {from: investor});
    (await token.balanceOf(this.crowdsale.address)).should.be.bignumber.equal(0);
    (await token.balanceOf(dev)).should.be.bignumber.equal(0);
    (await token.balanceOf(investor)).should.be.bignumber.equal(100);

    await this.crowdsale.tokenSweep(investor, token.address);
    (await token.balanceOf(this.crowdsale.address)).should.be.bignumber.equal(0);
    (await token.balanceOf(dev)).should.be.bignumber.equal(42);
    (await token.balanceOf(investor)).should.be.bignumber.equal(58);
  });

  it('should receive ERC20/standard tokens via transfer, and allow tokenSweep to dev', async function () {
    const MintableToken = artifacts.require('MintableToken');
    let token = await MintableToken.new();
    const result = await token.mint(investor, 100);
    await token.transfer(this.crowdsale.address, 42, {from: investor});
    (await token.balanceOf(this.crowdsale.address)).should.be.bignumber.equal(42);
    (await token.balanceOf(dev)).should.be.bignumber.equal(0);
    (await token.balanceOf(investor)).should.be.bignumber.equal(58);

    await this.crowdsale.tokenSweep(0x0, token.address);
    (await token.balanceOf(this.crowdsale.address)).should.be.bignumber.equal(0);
    (await token.balanceOf(dev)).should.be.bignumber.equal(42);
  });

  it('should receive ERC23Token tokens via tokenFallback, and auto-transfer to dev', async function () {
    let token = await MDToken.new(); // is ERC23Token, MintableToken
    const result = await token.mint(investor, 100);
    await token.transfer(this.crowdsale.address, 42, {from: investor});
    (await token.balanceOf(this.crowdsale.address)).should.be.bignumber.equal(0);
    (await token.balanceOf(dev)).should.be.bignumber.equal(42);
    (await token.balanceOf(investor)).should.be.bignumber.equal(58);
  });

  it('should receive ERC677Token tokens via approveAndCall, and auto-transfer to dev', async function () {
    let token = await MDToken.new(); // is ERC677Token, MintableToken
    const result = await token.mint(investor, 100);
    await token.approveAndCall(this.crowdsale.address, 42, null, {from: investor});
    (await token.balanceOf(this.crowdsale.address)).should.be.bignumber.equal(0);
    (await token.balanceOf(dev)).should.be.bignumber.equal(42);
    (await token.balanceOf(investor)).should.be.bignumber.equal(58);
  });

  it('should receive ERC677Token tokens via transferAndCall, and auto-transfer to dev', async function () {
    let token = await MDToken.new(); // is ERC677Token, MintableToken
    const result = await token.mint(investor, 100);
    await token.transferAndCall(this.crowdsale.address, 42, null, {from: investor});
    (await token.balanceOf(this.crowdsale.address)).should.be.bignumber.equal(0);
    (await token.balanceOf(dev)).should.be.bignumber.equal(42);
    (await token.balanceOf(investor)).should.be.bignumber.equal(58);
  });

});
