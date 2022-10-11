const Compiler = require('../contract-deployment/Compiler.js');
const Deployer = require('../contract-deployment/Deployer.js');
const dotenv = require('dotenv');


dotenv.config({ path: './../config.env' });

//Compiling contract
const compiler = new Compiler();
const compilerResult = compiler.compileContract('ProjectContract.sol');
const compiledContract = compilerResult.ProjectContract;
const abi = compiledContract.abi;
const evm = compiledContract.evm;

//Settings
const network = 'infura'; // 'ganache' (localhost test network), or 'infura' (Rinkeby test network)
let deploymentAccount = null;
let contractArgs = [];
let spentGas = '1000000'; // Gas spent in contract deployment (in wei)

/* Mnemonic to be used if infura network has been selected */
const infuraMnemonic = process.env.INFURA_MNEMONIC;

/* Infura's node URL. This node provides the conection to the Rinkeby network */
const infuraNodeURL = process.env.INFURA_NODE_URL;

const deployer = new Deployer();
let web3 = deployer.getWeb3Instance(network, infuraMnemonic, infuraNodeURL);

//If network is a test network, it's necessary select a test account
const getAccounts = async () => {
  try {
      //Selecting test deployment account
      if (network === 'ganache' || network === 'infura') {
          const accounts = await web3.eth.getAccounts();
          deploymentAccount = accounts[0]; //select a test account for deploy
      }
  } catch (err) {
   console.log(err);
  }
}

// Call for getAccounts before deploying the contract
getAccounts().then(
  async () => {
    
    contractArgs = [deploymentAccount, '1000000'];
    
    //Deploying the contract
    const deployedContract = await deployer.deployContract(abi, evm, web3, deploymentAccount, contractArgs, spentGas);
    
    console.log(deployedContract);
    
    if(network === 'ganache') {
      web3.currentProvider.engine.stop();
    }

    return;
  }
);


/* Accessing contract methods */
// const value = await deployedContract.methods.method_name().call(); // <-- Substituing 'method_name' for the name of the method that you waanna call.
// const transactionHash = await deployedContract.methods.method_name(args).send({ gas: spentGas, from: originAccount });