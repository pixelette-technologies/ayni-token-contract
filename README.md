# ANYI Token Smart Contract

## Table of Contents

- [ANYI Token Smart Contract](#anyi-token-smart-contract)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Features](#features)
    - [Sensible Defaults](#sensible-defaults)
    - [GitHub Actions](#github-actions)
  - [Installing Dependencies](#installing-dependencies)
- [Usage](#usage)
    - [Pre Requisites](#pre-requisites)
    - [Lint Solidity](#lint-solidity)
  - [Hardhat](#hardhat)
    - [Run a Hardhat chain](#run-a-hardhat-chain)
    - [Compile](#compile)
    - [TypeChain](#typechain)
    - [Test](#test)
    - [Lint TypeScript](#lint-typescript)
    - [Forking mainnet](#forking-mainnet)
    - [Coverage](#coverage)
    - [Clean](#clean)
    - [Deploy](#deploy)
    - [Generate Natspec Doc](#generate-natspec-doc)
    - [View Contracts Size](#view-contracts-size)
  - [Verify Contract](#verify-contract)
    - [Manual Verify](#manual-verify)
    - [Verify Contract Programmatically](#verify-contract-programmatically)
  - [Syntax Highlighting](#syntax-highlighting)
  - [Using GitPod](#using-gitpod)
  - [Contributing](#contributing)
  - [Thank You!](#thank-you)
  - [Resources](#resources)

## Getting Started

Recommended node version is v20.x

If you have [nvm](https://github.com/nvm-sh/nvm) then run:

```sh
$ nvm use
```

Then, install dependencies

```sh
$ make setup # install Node.js deps
```

or

```sh
$ yarn install
```

## Features

This template builds upon the frameworks and libraries mentioned above, so for details about their
specific features, please consult their respective documentations.

For example, for Hardhat, you can refer to the [Hardhat Tutorial](https://hardhat.org/tutorial) and
the [Hardhat Docs](https://hardhat.org/docs). You might be in particular interested in reading the
[Testing Contracts](https://hardhat.org/tutorial/testing-contracts) section.


### Sensible Defaults

This template comes with sensible default configurations in the following files:

```text
├── .editorconfig
├── .eslintignore
├── .eslintrc.yml
├── .gitignore
├── .prettierignore
├── .prettierrc.yml
├── .solcover.js
├── .solhintignore
├── .solhint.json
├── .yarnrc.yml
├── hardhat.config.ts
```

### GitHub Actions

This template comes with GitHub Actions pre-configured. Your contracts will be linted and tested on
every push and pull request made to the `main` branch.

Note though that by default it injects `.env.example` env variables into github action's
`$GITHUB_ENV`.

You can edit the CI script in [.github/workflows/ci.yml](./.github/workflows/ci.yml).

## Installing Dependencies

This is how to install dependencies:

    Install the dependency using your preferred package manager, e.g.
   `yarn add dependency-name:dependency-url`
   - Use this syntax to install from GitHub: `yarn add repo-name@github:username/repo-name#tag-name`

Note that OpenZeppelin Contracts is pre-installed, so you can follow that as an example.

# Usage

### Pre Requisites

You don't have to create a `.env` file, but filling in the environment variables may be useful when
deploying to testnet or mainnet or debugging and testing against a mainnet fork.

Follow the example in [`.env.example`](.env.example). You can choose to use either a mnemonic or
individual private key by setting `MNEMONIC` or `PRIVATE_KEY` in your `.env` file.

If you don't already have a mnemonic, use this [bip39](https://iancoleman.io/bip39/) to generate one
Or if you don't already have a private key, use this [vanity-eth](https://vanity-eth.tk/) to
generate one.

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

## Hardhat

### Run a Hardhat chain

To run a local network with all your contracts in it, run the following:

```sh
$ yarn chain
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain bindings:

```sh
$ yarn typechain
```

### Test

Run the tests with Hardhat:

```sh
$ yarn test

or

$ yarn test:gas         # shows gas report and contract size

```

Optional:

- See the actual fiat currency rates by setting your coingecko api key from
  [here](https://coinmarketcap.com/api/pricing/) in `.env` file or command.

- Set custom gas price (gwei) in `.env` file or command or let it automatically fetched by
  ethgasstationapi.

```sh
$ GAS_PRICE=20
$ COIN_MARKET_CAP_API_KEY="your_api_key"
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Forking mainnet

Starts a local hardhat chain with the state of the last `mainnet` block

```sh
$ yarn fork
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

### Deploy

Deploy all the contracts to Hardhat Network:

```sh
$ yarn deploy
```

Deploy AYNI Token contract only

```sh
$ yarn deploy-hardhat:token
```

Deploy AYNI Token and Governance related contracts

```sh
$ deploy-hardhat:tokenWithGovernor
```


Deploy the contracts to a specific network, such as the Goerli testnet:

```sh
$ yarn deploy:network hardhat
```

For more information on deploy check out repo
[hardhat-deploy](https://github.com/wighawag/hardhat-deploy)

### Generate Natspec Doc

Generate natspec documentation for your contracts by running

```sh
$ yarn hardhat dodoc
```

For more information on Natspec
[click here](https://docs.soliditylang.org/en/v0.8.12/natspec-format.html#natspec) and for dodoc
repo [click here](https://github.com/primitivefinance/primitive-dodoc)

### View Contracts Size

```sh
$ yarn hardhat size-contracts
```

or turn on for every compile

```sh
$ CONTRACT_SIZER=true
```

## Verify Contract

### Manual Verify

```sh
$ yarn hardhat verify --network <network> DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1" "Constructor argument 2"
```

For complex arguments you can refer
[here](https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html)

```sh
$ yarn hardhat verify --contract contracts/CONTRACT_NAME.sol:CONTRACT_NAME --network <network> --constructor-args arguments.js DEPLOYED_CONTRACT_ADDRESS
```

### Verify Contract Programmatically

Verify the contract using `verifyContract` function in [verify.ts](./utils/verify.ts)

Set block explorer api key in `.env` file or using command, refer to `.env.example` for more
insight.

Example deploy script with `verifyContract` function is
[00_aynitoken.ts](./deploy/00_aynitoken.ts)
[01_governor.ts](./deploy/01_governor.ts)

## Syntax Highlighting

If you use VSCode, you can enjoy syntax highlighting for your Solidity code via the
[vscode-solidity](https://github.com/juanfranblanco/vscode-solidity) extension.

## Using GitPod

[GitPod](https://www.gitpod.io/) is an open-source developer platform for remote development.

To view the coverage report generated by `yarn coverage`, just click `Go Live` from the status bar
to turn the server on/off.

## Contributing

Contributions are always welcome! Open a PR or an issue!

## Thank You!

## Resources

- [Hardhat Documentation](https://hardhat.org/getting-started/)
