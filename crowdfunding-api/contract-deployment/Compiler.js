const path = require('path');
const fs = require('fs');
const solc = require('solc');

module.exports = class Compiler {

    constructor() {
    }

    compileContract(contractFileName) {

      console.log(`Starting compilation of ${contractFileName}`);

      //Include here all contracts to be compiled
      const contractPath = path.resolve(__dirname, '../contracts', contractFileName);
      const contractSource = fs.readFileSync(contractPath, 'utf8');

      const input = {
        language: 'Solidity',
        sources: {
          'contract 1': {
            content: contractSource,
          },
        },
        settings: {
          outputSelection: {
            '*': {
              '*': ['*'],
            },
          },
        },
      };

      //console.log("Compiling:.. " + JSON.parse(solc.compile(JSON.stringify(input))).contracts['CourseContract.sol'].CourseContract);

      let result;

      /* Must have an IF condition for each contract class in contracts directory */
      //if (contractFileName === 'ProjectContract.sol') {
        result = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
          'contract 1'
        ];
      //}

      console.log(`Compilation of ${contractFileName} complete!`);

      //module.exports = result;
      return result;
    }

}
//
// let compiler = new Compiler();
// console.log(compiler);
