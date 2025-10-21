import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dotenv from "dotenv";
dotenv.config();

export default buildModule("SafeLockTestnet", (m) => {
  const INITIAL_OWNER = process.env.INITIAL_OWNER as string;

  // Deploy Mock ERC20 tokens for testing
  const mockCUSD = m.contract("MockERC20", ["Celo Dollar", "cUSD"], {
    id: "MockCUSD"
  });
  
  const mockUSDT = m.contract("MockERC20", ["Tether USD", "USDT"], {
    id: "MockUSDT"
  });
  
  const mockCGHS = m.contract("MockERC20", ["Celo Ghanaian Cedi", "cGHS"], {
    id: "MockCGHS"
  });
  
  const mockCNGN = m.contract("MockERC20", ["Celo Nigerian Naira", "cNGN"], {
    id: "MockCNGN"
  });
  
  const mockCKES = m.contract("MockERC20", ["Celo Kenyan Shilling", "cKES"], {
    id: "MockCKES"
  });

  // Deploy SafeLock with mock token addresses
  const safeLock = m.contract("SafeLock", [
    mockCUSD,
    mockUSDT,
    mockCGHS,
    mockCNGN,
    mockCKES,
    INITIAL_OWNER
  ]);

  return {
    mockCUSD,
    mockUSDT,
    mockCGHS,
    mockCNGN,
    mockCKES,
    safeLock
  };
});

