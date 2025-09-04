import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
require("dotenv").config();

export default buildModule("SafeLock", (m) => {
  // Celo cUSD token addresses - validate and format
  const cUSD_ALFAJORES_ADDRESS = process.env.CUSD_ALFAJORES;
  const INITIAL_OWNER = process.env.INITIAL_OWNER;

  // Deploy the SafeLock contract with constructor parameters
  const SafeLock = m.contract("SafeLock", [
    cUSD_ALFAJORES_ADDRESS,
    INITIAL_OWNER
  ]);

  // Deploy MockERC20 for testing
  const MockERC20 = m.contract("MockERC20", ["Celo Dollar", "cUSD"]);

  return {
    SafeLock,
    MockERC20
  };
});
