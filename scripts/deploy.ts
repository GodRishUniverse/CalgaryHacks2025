import { ethers } from "hardhat";

async function main() {
  console.log("Deploying WildlifeDAO contracts...");

  // First deploy the WLD Token
  const WildlifeDAOToken = await ethers.getContractFactory("WildlifeDAOToken");
  const wldToken = await WildlifeDAOToken.deploy();
  await wldToken.waitForDeployment();
  
  console.log("WildlifeDAOToken deployed to:", await wldToken.getAddress());

  // Then deploy the DAO with the token address
  const WildlifeDAO = await ethers.getContractFactory("WildlifeDAO");
  const wildlifeDAO = await WildlifeDAO.deploy(await wldToken.getAddress());
  await wildlifeDAO.waitForDeployment();

  console.log("WildlifeDAO deployed to:", await wildlifeDAO.getAddress());

  // Set the DAO contract in the token
  const setDAOTx = await wldToken.setDAOContract(await wildlifeDAO.getAddress());
  await setDAOTx.wait();
  
  console.log("DAO contract set in token");

  // Verify contracts on Etherscan
  console.log("Verifying contracts on Etherscan...");
  
  try {
    await run("verify:verify", {
      address: await wldToken.getAddress(),
      constructorArguments: [],
    });
  } catch (error) {
    console.log("Error verifying WildlifeDAOToken:", error);
  }

  try {
    await run("verify:verify", {
      address: await wildlifeDAO.getAddress(),
      constructorArguments: [await wldToken.getAddress()],
    });
  } catch (error) {
    console.log("Error verifying WildlifeDAO:", error);
  }

  console.log("Deployment completed!");
  console.log("Token address:", await wldToken.getAddress());
  console.log("DAO address:", await wildlifeDAO.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 