const HDWalletProvider = require('@truffle/hdwallet-provider'); // Provider for Rinkeby Network
const ganache = require("ganache-cli"); // Provider for local network
const Web3 = require('web3');

module.exports = class Deployer {

    constructor() {

    }

    getWeb3Instance(network, mnemonic, networkNodeURL) {
      let provider;

      console.log(`Starting web3 instance creation for ${network} network`);

      //Selecting the provider do deploy the contract
      try {
          if (network === 'ganache') {
              provider = ganache.provider();
              console.log("Web3 Ganache Provider");
          }
          else if (network === 'infura') {
              provider = new HDWalletProvider(
                mnemonic,
                networkNodeURL
              );
          }
      } catch (err) {
         console.log(err);
         return;
      }

      // Creating web3 instance
      let web3 = new Web3(provider);

      console.log(`Web3 instance: ${web3}`);

      return web3;
    }


    async deployContract(abi, evm, web3, deploymentAccount, contractArgs, spentGas) {

      console.log('Attempting to deploy from account', deploymentAccount);

      let result;

      try {
        result = await new web3.eth.Contract(abi)
          .deploy({ data: evm.bytecode.object, arguments: contractArgs })
          .send({ gas: spentGas, from: deploymentAccount });

      } catch (err) {
        console.log(err);
      }

      console.log(`Contract deployed to: Address: ${result.options.address}`);

      return result;
    };
}
