import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Script to mint test tokens to specified addresses
 * Run after deploying to testnet
 * 
 * Usage:
 * npx hardhat run scripts/mint-test-tokens.ts --network alfajores
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Minting test tokens with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Read deployed addresses from ignition deployment
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const deploymentPath = path.join(
    __dirname,
    "../ignition/deployments",
    `chain-${chainId}`,
    "deployed_addresses.json"
  );

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found. Please deploy contracts first.");
    console.error(`   Looking for: ${deploymentPath}`);
    process.exit(1);
  }

  const deployedAddresses = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  
  // Extract token addresses
  const mockCUSDAddress = deployedAddresses["SafeLockTestnet#MockCUSD"];
  const mockUSDTAddress = deployedAddresses["SafeLockTestnet#MockUSDT"];
  const mockCGHSAddress = deployedAddresses["SafeLockTestnet#MockCGHS"];
  const mockCNGNAddress = deployedAddresses["SafeLockTestnet#MockCNGN"];
  const mockCKESAddress = deployedAddresses["SafeLockTestnet#MockCKES"];

  if (!mockCUSDAddress || !mockUSDTAddress || !mockCGHSAddress || !mockCNGNAddress || !mockCKESAddress) {
    console.error("❌ Token addresses not found in deployment file");
    process.exit(1);
  }

  console.log("\n📋 Token Addresses:");
  console.log("MockCUSD:", mockCUSDAddress);
  console.log("MockUSDT:", mockUSDTAddress);
  console.log("MockCGHS:", mockCGHSAddress);
  console.log("MockCNGN:", mockCNGNAddress);
  console.log("MockCKES:", mockCKESAddress);

  // Get MockERC20 contract factory
  const MockERC20 = await ethers.getContractFactory("MockERC20");

  // Amount to mint (e.g., 100,000 tokens with 18 decimals)
  const MINT_AMOUNT = ethers.parseEther("100000");

  // Address to mint to (deployer by default, can be changed)
  const recipientAddress = deployer.address;

  console.log(`\n💰 Minting ${ethers.formatEther(MINT_AMOUNT)} tokens to: ${recipientAddress}\n`);

  // Mint tokens for each contract
  const tokens = [
    { name: "MockCUSD", address: mockCUSDAddress },
    { name: "MockUSDT", address: mockUSDTAddress },
    { name: "MockCGHS", address: mockCGHSAddress },
    { name: "MockCNGN", address: mockCNGNAddress },
    { name: "MockCKES", address: mockCKESAddress },
  ];

  for (const token of tokens) {
    try {
      const tokenContract = MockERC20.attach(token.address);
      
      console.log(`Minting ${token.name}...`);
      const tx = await tokenContract.mint(recipientAddress, MINT_AMOUNT);
      await tx.wait();
      
      const balance = await tokenContract.balanceOf(recipientAddress);
      console.log(`✅ ${token.name} minted! Balance: ${ethers.formatEther(balance)}`);
    } catch (error) {
      console.error(`❌ Failed to mint ${token.name}:`, error);
    }
  }

  console.log("\n🎉 All tokens minted successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update your frontend with the deployed contract addresses");
  console.log("2. Test the SafeLock contract functionality");
  console.log("3. Register a user and create a test savings lock");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

