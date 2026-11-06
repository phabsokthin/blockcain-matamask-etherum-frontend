import { BaseWallet, parseEther } from "ethers";
import { getContract, getContractWithWallet } from "./contract";

export interface SendEthOptions {
  onTransactionHash?: (hash: string) => void;
  inAppWallet?: BaseWallet;
}

/**
 * Sends Ether to a recipient through the WalletTransfer smart contract.
 * If options.inAppWallet is provided, signs and broadcasts 100% on the frontend without any MetaMask popup.
 * Otherwise, uses the MetaMask extension signer.
 * @param recipient The recipient's Ethereum address.
 * @param amount The amount of ETH to send as a decimal string (e.g. "0.01").
 * @param options Optional callbacks and wallet configuration.
 * @returns The confirmed transaction hash.
 */
export async function sendETH(
  recipient: string,
  amount: string,
  options?: SendEthOptions
): Promise<string> {
  let contract;

  if (options?.inAppWallet) {
    // 100% Frontend signing using in-app wallet (No MetaMask extension popup!)
    contract = getContractWithWallet(options.inAppWallet);
  } else {
    // MetaMask extension signer
    const ctx = await getContract();
    contract = ctx.contract;
  }

  const tx = await contract.sendEther(recipient, {
    value: parseEther(amount),
  });

  console.log("Transaction Broadcasted, Hash:", tx.hash);
  options?.onTransactionHash?.(tx.hash);

  const receipt = await tx.wait();

  if (!receipt || receipt.status !== 1) {
    throw new Error("Transaction failed or was reverted on-chain.");
  }

  return tx.hash;
}
