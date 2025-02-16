const { ethers } = require("hardhat");

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log(
      "Account balance:",
      (await deployer.provider.getBalance(deployer.address)).toString()
    );

    // Deploy WildlifeDAOToken first
    console.log("Deploying WildlifeDAOToken...");
    const WildlifeDAOToken =
      await ethers.getContractFactory("WildlifeDAOToken");
    const token = await WildlifeDAOToken.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("WildlifeDAOToken deployed to:", tokenAddress);

    // Deploy WildlifeDAO with token address
    console.log("Deploying WildlifeDAO...");
    const WildlifeDAO = await ethers.getContractFactory("WildlifeDAO");
    const dao = await WildlifeDAO.deploy(tokenAddress);
    await dao.waitForDeployment();
    const daoAddress = await dao.getAddress();
    console.log("WildlifeDAO deployed to:", daoAddress);

    // Set DAO contract in token
    console.log("Setting DAO contract in token...");
    const setDAOTx = await token.setDAOContract(daoAddress);
    await setDAOTx.wait();
    console.log("DAO contract set in token");

    console.log("\nDeployment complete! 🎉");
    console.log("Token address:", tokenAddress);
    console.log("DAO address:", daoAddress);

    // Save these addresses - we'll need them for the frontend
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
