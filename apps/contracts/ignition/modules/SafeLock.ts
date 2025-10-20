import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dotenv from "dotenv";
dotenv.config();

export default buildModule("SafeLock", (m) => {
  const cUSD_ADDRESS = process.env.CUSD_MAINNET as string;
  const USDT_ADDRESS = process.env.USDT_ADDRESS as string;
  const CGHS_ADDRESS = process.env.CGHS_ADDRESS as string;
  const CNGN_ADDRESS = process.env.CNGN_ADDRESS as string;
  const CKES_ADDRESS = process.env.CKES_ADDRESS as string;
  const INITIAL_OWNER = process.env.INITIAL_OWNER as string;

  const SafeLock = m.contract("SafeLock", [
    cUSD_ADDRESS,
    USDT_ADDRESS,
    CGHS_ADDRESS,
    CNGN_ADDRESS,
    CKES_ADDRESS,
    INITIAL_OWNER
  ]);

  return {
    SafeLock
  };
});
