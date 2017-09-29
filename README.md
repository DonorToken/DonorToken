# DonorToken
[![Build Status](https://img.shields.io/travis/DonorToken/DonorToken.svg?branch=master&style=flat-square)](https://travis-ci.org/DonorToken/DonorToken)
[![Coverage Status](https://coveralls.io/repos/github/DonorToken/DonorToken/badge.svg?branch=master)](https://coveralls.io/github/DonorToken/DonorToken?branch=master)

DonorToken is a donation-powered, best-practices-focused ERC token + crowdsale project, implementing ERC20, ERC23, ERC677, & more.

Built on the shoulders of [OpenZeppelin](https://github.com/OpenZeppelin/zeppelin-solidity), a library for writing secure smart contracts on Ethereum.

## Getting Started
```sh
npm install
npm run test
```

You'll also get all the OpenZeppelin contracts in the `node_modules/zeppelin-solidity/contracts` folder.

We also recommend the excellent [solidity-flattener](https://github.com/BlockCatIO/solidity-flattener) to flatten deploy-ready Solidity code with imports into a single file, i.e.:
```sh
export DT_PAR="/path/to/parentdir" # put this in .bash_profile and reboot terminal
solidity_flattener --solc-paths="zeppelin-solidity/=$DT_PAR/DonorToken/node_modules/zeppelin-solidity/" --output flattened/flat-YOURFILE.sol contracts/YOURFILE.sol
```


## Security
DonorToken is meant to provide secure, tested, and community-audited code, but please use common sense when doing anything that deals with real money! We take no responsibility for your implementation decisions and any security problem you might experience.

If you find a security issue, please email [dev@DonorToken.com](mailto:dev@DonorToken.com).

## Roadmap
- stakeholder DAOs
- upgradeable codebases
- implement [ENS](https://github.com/ethereum/ens) (currently bypassed for gas savings)
- gas optimization (continual)

## Contributing
- [Issue tracker](https://github.com/DonorToken/DonorToken/issues)
- [Contribution guidelines](CONTRIBUTING.md)
- Dev fund (ETH): 0x2F6dA3986a36f8dBd559b94CF9D6857779b429E2 or donortoken.eth

## DonorTokens
- [MEWT](https://github.com/DonorToken/MEWT)

...more coming soon!

## Discuss & Follow
- [r/DonorToken](https://www.reddit.com/r/DonorToken)
- [@DonorToken](https://twitter.com/DonorToken)
- [+DonorToken](https://www.facebook.com/DonorTokens)
- [DonorToken @ Telegram](https://t.me/DonorTokens)
- [DonorToken @ BitcoinTalk](http://bitcointalk.DonorToken.com)
- [DonorToken.com](http://DonorToken.com)


## License
Code released under the [MIT License](LICENSE).
