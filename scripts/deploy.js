const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment of MyToken...");

    // Get the contract factory
    const MyToken = await ethers.getContractFactory("MyToken");

    // Deploy the contract
    const myToken = await MyToken.deploy();

    // Wait for deployment to finish
    await myToken.waitForDeployment();

    // Get the contract address
    const contractAddress = await myToken.getAddress();

    console.log(`MyToken deployed successfully to: ${contractAddress}`);

    // Verify contract on etherscan if not on a local network
    if (network.name !== "hardhat" && network.name !== "localhost") {
      console.log("Waiting for block confirmations...");

      // Wait for 6 block confirmations
      await myToken.deploymentTransaction().wait(6);

      console.log("Verifying contract on Etherscan...");

      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });

      console.log("Contract verified on Etherscan");
    }

    // Get initial token supply
    const totalSupply = await myToken.totalSupply();
    console.log(`Initial total supply: ${ethers.formatEther(totalSupply)} ATE`);

    // Get deployer balance
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await myToken.balanceOf(deployer.address);
    console.log(`Deployer balance: ${ethers.formatEther(deployerBalance)} ATE`);
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exitCode = 1;
  }
}

// Execute deployment
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
