const Compiler = require('./../contract-deployment/Compiler');
const Deployer = require('./../contract-deployment/Deployer');
const dotenv = require('dotenv');

dotenv.config({ path: './../config.env' });

/* Create a smart contract for a specific project */
exports.createProjectContract = async (ownerEthereumAccount, targetValue) => {

    //Compiling the project smart contract from ProjectContract source.
    const compiler = new Compiler();
    const compilerResult = compiler.compileContract('ProjectContract.sol');
    const compiledContract = compilerResult.ProjectContract;
    const abi = compiledContract.abi;
    const evm = compiledContract.evm;

    //Settings
    const network = process.env.ETHEREUM_NETWORK_NAME; // 'ganache' (localhost test network), or 'infura' (Rinkeby test network)
    let deploymentAccount = null;
    let contractArgs = [];
    let spentGas = '1000000'; // Gas spent in contract deployment (in wei)

    /* Mnemonic of GreenHub's account. This account is used to deploy the project smart contract */
    const greenhubAccountMnemonic = process.env.INFURA_MNEMONIC;

    /* Ethereum network node URL. This node provides the conection to the selected ethereum network */
    const networkNodeURL = process.env.INFURA_NODE_URL;

    const deployer = new Deployer();
    let web3 = deployer.getWeb3Instance(network, greenhubAccountMnemonic, networkNodeURL);

    //Selecting test deployment account
    if (network === 'ganache' || network === 'infura') {
        const accounts = await web3.eth.getAccounts();
        deploymentAccount = accounts[0]; //select a test account for deploy
    }

    contractArgs = [deploymentAccount, '1000000'];
    
    //Deploying the contract
    const deployedContract = await deployer.deployContract(abi, evm, web3, deploymentAccount, contractArgs, spentGas);
    const contractAddress = deployedContract.options.address;

    //console.log(deployedContract);
    if(network === 'ganache') {
      web3.currentProvider.engine.stop();
    }

    return contractAddress;
}