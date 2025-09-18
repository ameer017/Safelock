import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dotenv from "dotenv";
dotenv.config();

export default buildModule("SafeLock", (m) => {
  const cUSD_ADDRESS = process.env.CUSD_MAINNET as string;
  const INITIAL_OWNER = process.env.INITIAL_OWNER as string;

  const SafeLock = m.contract("SafeLock", [
    cUSD_ADDRESS,
    INITIAL_OWNER
  ]);

  return {
    SafeLock
  };
});
