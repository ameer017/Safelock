import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "dotenv/config";

export default buildModule("SafeLock", (m) => {
  // Celo cUSD token address for Alfajores testnet
  const cUSD_ALFAJORES_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  // Use the deployer as the initial owner
  const INITIAL_OWNER = "0x82A326C204e0592457921B60cA2FB1Ec8e340c72"

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
