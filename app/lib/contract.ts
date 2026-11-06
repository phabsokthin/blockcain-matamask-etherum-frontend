import { BaseWallet, BrowserProvider, Contract, JsonRpcProvider, JsonRpcSigner } from "ethers";

export const CONTRACT_ADDRESS =
  "0xAb190C0D849bEBeBe72e71B50d29F60bb7931551"; // start contract deploy

export const CONTRACT_ABI = [
  "function sendEther(address payable recipient) external payable",
  "event TransferSent(address indexed sender, address indexed recipient, uint256 amount)",
] as const;

export const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

/**
 * Returns a direct Sepolia JSON-RPC provider (bypasses browser extensions).
 */
export function getSepoliaJsonRpcProvider(): JsonRpcProvider {
  return new JsonRpcProvider(SEPOLIA_RPC_URL);
}

/**
 * Creates an instance of the WalletTransfer contract attached to an in-app Wallet.
 * Transactions signed with this contract do NOT open any MetaMask popup.
 */
export function getContractWithWallet(wallet: BaseWallet): Contract {
  const connectedWallet = wallet.provider
    ? wallet
    : wallet.connect(getSepoliaJsonRpcProvider());
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, connectedWallet);
}

export interface ContractContext {
  contract: Contract;
  provider: BrowserProvider;
  signer: JsonRpcSigner;
}

/**
 * Initializes and returns the WalletTransfer contract instance attached to the MetaMask extension signer.
 */
export async function getContract(): Promise<ContractContext> {
  if (!window.ethereum) {
    throw new Error("MetaMask extension not found. Please install MetaMask.");
  }

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== BigInt(11155111)) {
    throw new Error("Please switch your wallet to Sepolia Testnet.");
  }

  const signer = await provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  return { contract, provider, signer };
}
