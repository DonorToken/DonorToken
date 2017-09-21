pragma solidity ^0.4.13;

import 'zeppelin-solidity/contracts/token/VestedToken.sol';

// mock class using StandardToken
contract VestedTokenMock is VestedToken {
  function VestedTokenMock(address initialAccount, uint256 initialBalance) {
    balances[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }
}
