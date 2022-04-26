

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
import "@nomiclabs/hardhat-web3";


const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: '0.8.1',
  defaultNetwork: 'rinkeby',
  networks: {
    hardhat: {},
    rinkeby: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    ganache: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  paths: {
    sources: "src/contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};