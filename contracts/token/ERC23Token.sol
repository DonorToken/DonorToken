pragma solidity ^0.4.13;

import "zeppelin-solidity/contracts/token/BasicToken.sol";
import "../base/ERC23Contract.sol";


// implements ERC23
// see: https://github.com/ethereum/EIPs/issues/23
// help from ERC23TokenMock.sol
// see also:
// https://github.com/Dexaran/ERC23-tokens
// https://github.com/Opus-foundation/contracts/blob/master/contracts/ERC23BasicToken.sol
contract ERC23Token is BasicToken, ERC23Contract {

  // errors out if named "Transfer", or if "bytes data" is indexed :(
  event TransferERC23(address indexed from, address indexed to, uint256 value, bytes /*indexed*/ data);

  function transfer(address _to, uint256 _value, bytes _data) public returns (bool success) {
    super.transfer(_to, _value);

    if (isContract(_to)) {
      ERC23ContractInterface receiver = ERC23ContractInterface(_to);
      receiver.tokenFallback(msg.sender, _value, _data);
    }

    TransferERC23(msg.sender, _to, _value, _data);
    return true;
  }

  // ERC23 compatible transfer function (2-arg, for backwards compatibility)
  function transfer(address _to, uint256 _value) public returns (bool success) {
    bytes memory empty;
    return transfer(_to, _value, empty);
  }

  // whether given address is a contract or not based on bytecode
  function isContract(address _addr) internal constant returns (bool success) {
    uint256 length = 0;
    assembly {
      length := extcodesize(_addr)
    }
    return (length > 1); // testing returned size "1" for non-contract accounts, so we're gonna use that.
  }
}
