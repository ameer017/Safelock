import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
require("dotenv").config();

export default buildModule("SafeLock", (m) => {
  // Celo cUSD token addresses
  const cUSD_ALFAJORES_ADDRESS = process.env.CUSD_ALFAJORES_ADDRESS;
  
  // Deploy the implementation contract
  const safeLockImplementation = m.contract("SafeLock");
  
  // Deploy the proxy contract with initialization
  const safeLockProxy = m.contract("SafeLockProxy", [
    safeLockImplementation,
    "0x" // Placeholder for init data - will be set during deployment
  ]);
  
  return { 
    safeLockImplementation,
    safeLockProxy 
  };
});
