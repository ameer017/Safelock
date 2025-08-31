import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
require("dotenv").config();

export default buildModule("Cartridge", (m) => {
  // Celo cUSD token addresses
  const cUSD_ALFAJORES_ADDRESS = process.env.CUSD_ALFAJORES_ADDRESS;
  
  // Deploy the implementation contract
  const CartridgeImplementation = m.contract("Cartridge");
  
  // Deploy the proxy contract with initialization
  const CartridgeProxy = m.contract("CartridgeProxy", [
    CartridgeImplementation,
    "0x" // Placeholder for init data - will be set during deployment
  ]);
  
  return { 
    CartridgeImplementation,
    CartridgeProxy 
  };
});
