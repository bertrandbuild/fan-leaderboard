const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CampaignFactory to Chiliz Chain...");
  
  const [deployer] = await ethers.getSigners();
  
  console.log("📝 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  
  // Deploy CampaignFactory
  const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
  const campaignFactory = await CampaignFactory.deploy();
  
  await campaignFactory.waitForDeployment();
  
  const contractAddress = await campaignFactory.getAddress();
  console.log("✅ CampaignFactory deployed to:", contractAddress);
  
  // Get PSG token addresses
  const [psgUnwrapped, psgWrapped] = await campaignFactory.getPSGTokens();
  console.log("🏆 PSG Unwrapped Token:", psgUnwrapped);
  console.log("🏆 PSG Wrapped Token:", psgWrapped);
  
  // Save deployment info
  const deploymentInfo = {
    network: "chiliz",
    chainId: 88882,
    campaignFactory: contractAddress,
    psgUnwrapped: psgUnwrapped,
    psgWrapped: psgWrapped,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await deployer.provider.getBlockNumber(),
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Write to file for backend integration
  const fs = require('fs');
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to deployment.json");
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("🔗 You can now integrate this contract address in your backend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 