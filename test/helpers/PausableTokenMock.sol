pragma solidity ^0.4.13;

import 'zeppelin-solidity/contracts/token/PausableToken.sol';

// mock class using PausableToken
contract PausableTokenMock is PausableToken {

  function PausableTokenMock(address initialAccount, uint initialBalance) {
    balances[initialAccount] = initialBalance;
  }

}
