/* ==========================================================================
   Types, Interfaces, Constants & Storage Utilities for Wallet DApp
   ========================================================================== */

export interface EthereumRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface Eip1193Provider {
  request: (args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export interface NetworkConfig {
  readonly chainIdHex: string;
  readonly chainIdDec: number;
  readonly name: string;
  readonly currencyName: string;
  readonly currencySymbol: string;
  readonly decimals: number;
  readonly rpcUrls: readonly string[];
  readonly blockExplorerUrls: readonly string[];
}

export interface SavedInAppWallet {
  address: string;
  privateKey: string;
  label?: string;
  createdAt: number;
  keystoreJson?: string;
}

export interface DraftWalletInfo {
  address: string;
  privateKey: string;
  mnemonic?: string;
  keystoreJson?: string;
  password?: string;
}

export const SEPOLIA_CONFIG: NetworkConfig = {
  chainIdHex: "0xaa36a7",
  chainIdDec: 11155111,
  name: "Sepolia Testnet",
  currencyName: "Sepolia ETH",
  currencySymbol: "ETH",
  decimals: 18,
  rpcUrls: [
    "https://rpc.sepolia.org",
    "https://ethereum-sepolia-rpc.publicnode.com",
  ],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
} as const;

export const STORAGE_KEY_WALLETS = "dapp_in_app_wallets";
export const STORAGE_KEY_ACTIVE_ADDR = "dapp_in_app_active_address";
export const STORAGE_KEY_DISCONNECTED = "dapp_session_disconnected";

/**
 * Pre-configured static accounts with addresses, private keys, and balances.
 */
export const PRIVATE_KEY = [
  {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    label: "Demo Account 1",
    privateKey: "8b5e7ae9e1c943d6bd23e6c827b2e02010b656338dfd7f4cfa52610aa6545aed",
    balance: "1.50",
  },
  {
    address: "0x53d284357ec70cE289D6D64134DfAc8E511c8a3D",
    label: "Demo Account 2",
    privateKey: "550d7ab59f47231d329b723c0701a4cc9535cefd8392585b6831993987f6b6d0",
  },
  {
    address: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
    label: "Demo Account 3",
    privateKey: "0cf74b9425423c56a253852e3b263c2b8880be6d9cc3b662234f7a2a0cf151fc",
  },
] as const;

/**
 * Downloads standard Ethereum Keystore V3 JSON file
 */
export function downloadKeystoreJson(address: string, jsonString: string): void {
  if (typeof window === "undefined" || !jsonString) return;
  try {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const cleanAddress = address.toLowerCase().replace(/^0x/, "");
    anchor.href = url;
    anchor.download = `UTC--${timestamp}--${cleanAddress}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Keystore download failed:", err);
  }
}

/**
 * Storage helpers
 */
export function getStoredInAppWallets(): SavedInAppWallet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WALLETS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveInAppWalletToStorage(wallet: SavedInAppWallet): void {
  if (typeof window === "undefined") return;
  const list = getStoredInAppWallets();
  const existingIdx = list.findIndex(
    (w) => w.address.toLowerCase() === wallet.address.toLowerCase()
  );
  if (existingIdx >= 0) {
    list[existingIdx] = wallet;
  } else {
    list.push(wallet);
  }
  localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(list));
  localStorage.setItem(STORAGE_KEY_ACTIVE_ADDR, wallet.address);
}

export function setActiveInAppWalletAddress(address: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_ADDR, address);
}

export function clearInAppWalletsFromStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_WALLETS);
  localStorage.removeItem(STORAGE_KEY_ACTIVE_ADDR);
}

/**
 * Safely looks up the private key for a given account using PRIVATE_KEY static array only as set.
 */
export function getPrivateKeyForAddress(
  targetAddress: string,
  accountIndex: number = 0
): string {
  if (!targetAddress) return PRIVATE_KEY[0].privateKey;

  // 1. Try matching by address in static PRIVATE_KEY
  const match = PRIVATE_KEY.find(
    (p) => p.address.toLowerCase() === targetAddress.toLowerCase()
  );
  if (match?.privateKey) {
    return match.privateKey.startsWith("0x") ? match.privateKey : `0x${match.privateKey}`;
  }

  // 2. Otherwise match by account index (Account 1 -> PRIVATE_KEY[0], Account 2 -> PRIVATE_KEY[1], etc.)
  const item = PRIVATE_KEY[accountIndex % PRIVATE_KEY.length];
  if (item?.privateKey) {
    return item.privateKey.startsWith("0x") ? item.privateKey : `0x${item.privateKey}`;
  }

  return PRIVATE_KEY[0].privateKey;
}

export function parseWalletError(error: unknown, fallbackMessage: string): string {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      code?: number | string;
      message?: string;
      shortMessage?: string;
      reason?: string;
    };
    if (
      err.code === 4001 ||
      (typeof err.message === "string" && err.message.includes("ACTION_REJECTED"))
    ) {
      return "Transaction or request was rejected.";
    }
    if (err.code === -32002) {
      return "MetaMask request is already pending. Please open your extension.";
    }
    if (typeof err.message === "string" && err.message.includes("origin")) {
      return "MetaMask permission check failed. Please open MetaMask directly to manage connected accounts.";
    }
    if (err.shortMessage) {
      return err.shortMessage;
    }
    if (err.reason) {
      return err.reason;
    }
    if (typeof err.message === "string") {
      if (err.message.includes("insufficient funds")) {
        return "Insufficient funds for transfer amount and gas fees. Please get test ETH from the Sepolia faucet.";
      }
      return err.message;
    }
  }
  if (error instanceof Error) {
    if (error.message.includes("origin")) {
      return "MetaMask permission check failed. Please open MetaMask directly to manage connected accounts.";
    }
    if (error.message.includes("insufficient funds")) {
      return "Insufficient funds for transfer amount and gas fees. Please get test ETH from the Sepolia faucet.";
    }
    return error.message;
  }
  return fallbackMessage;
}

export async function getAllMetaMaskAccounts(): Promise<string[]> {
  if (typeof window === "undefined" || !window.ethereum) return [];
  const results: string[] = [];

  try {
    const accs = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
    if (Array.isArray(accs)) {
      results.push(...accs);
    }
  } catch (err) {
    console.warn("eth_accounts fetch failed:", err);
  }

  try {
    const permissions = (await window.ethereum.request({
      method: "wallet_getPermissions",
    })) as Array<{
      parentCapability: string;
      caveats?: Array<{ type: string; value: string[] }>;
    }>;

    if (Array.isArray(permissions)) {
      for (const perm of permissions) {
        if (perm.parentCapability === "eth_accounts" && Array.isArray(perm.caveats)) {
          for (const cav of perm.caveats) {
            if (Array.isArray(cav.value)) {
              results.push(...cav.value);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("wallet_getPermissions fetch failed:", err);
  }

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const acc of results) {
    if (acc && typeof acc === "string") {
      const lower = acc.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(acc);
      }
    }
  }

  return unique;
}

export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function formatEthBalance(balanceStr: string): string {
  const value = parseFloat(balanceStr);
  if (isNaN(value) || value === 0) return "0.0000";
  if (value < 0.0001) return "< 0.0001";
  return value.toFixed(4);
}

export function subscribeMetaMask(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleInitialized = () => {
    callback();
  };

  window.addEventListener("ethereum#initialized", handleInitialized, { once: true });

  const interval = setInterval(() => {
    if (window.ethereum) {
      callback();
      clearInterval(interval);
    }
  }, 150);

  const timeout = setTimeout(() => {
    clearInterval(interval);
  }, 3000);

  return () => {
    window.removeEventListener("ethereum#initialized", handleInitialized);
    clearInterval(interval);
    clearTimeout(timeout);
  };
}

export function subscribeStorage(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
  };
}

