require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Default Ganache URL
      // You can get a private key from one of your Ganache accounts
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.PROCESS_API}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: `${process.env.PROCESS_API}`,
  },
};
