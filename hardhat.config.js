require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Default Ganache URL
      // You can get a private key from one of your Ganache accounts
      accounts: [
        "0x3da02b14e73e64de2e4d83a192c168aace1e0efb096082d5ae36430acdc9ff23",
      ],
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/15fbee1823ea4f5ea903e9e1e7e2183f`,
      accounts: [
        "0x3da02b14e73e64de2e4d83a192c168aace1e0efb096082d5ae36430acdc9ff23",
      ],
    },
  },
  etherscan: {
    apiKey: "15fbee1823ea4f5ea903e9e1e7e2183f",
  },
};
