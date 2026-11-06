"use client";

import React from "react";
import { truncateAddress, getStoredInAppWallets } from "../types/wallet";

interface TransferConfirmModalProps {
  isOpen: boolean;
  isTransferring: boolean;
  transferStatus: "idle" | "broadcasting" | "confirming" | "success" | "error";
  txHash: string;
  transferAmount: string;
  displayName: string;
  account: string;
  trimmedRecipient: string;
  contractAddress: string;
  selectedAccountPrivateKey: string;
  showTransferConfirmKey: boolean;
  setShowTransferConfirmKey: (show: boolean) => void;
  walletType: "metamask" | "in_app" | null;
  frontendSignerKeyInput: string;
  setFrontendSignerKeyInput: (val: string) => void;
  showFrontendKeyPrompt: boolean;
  setShowFrontendKeyPrompt: (show: boolean) => void;
  transferErrorMessage: string;
  onClose: () => void;
  onExecuteTransfer: () => void;
}

export function TransferConfirmModal({
  isOpen,
  isTransferring,
  transferStatus,
  txHash,
  transferAmount,
  displayName,
  account,
  trimmedRecipient,
  contractAddress,
  selectedAccountPrivateKey,
  showTransferConfirmKey,
  setShowTransferConfirmKey,
  walletType,
  frontendSignerKeyInput,
  setFrontendSignerKeyInput,
  showFrontendKeyPrompt,
  setShowFrontendKeyPrompt,
  transferErrorMessage,
  onClose,
  onExecuteTransfer,
}: TransferConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-base">
              🚀
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Confirm Transfer on Frontend
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
                Sepolia Smart Contract Execution
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!isTransferring) {
                onClose();
              }
            }}
            disabled={isTransferring}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer disabled:opacity-30"
          >
            ✕
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* SUCCESS VIEW */}
          {transferStatus === "success" && txHash ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl font-extrabold shadow-inner">
                ✓
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  Transfer Confirmed & Broadcasted!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your transaction was successfully mined on Sepolia Testnet.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Transaction Hash</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-orange-600 font-bold hover:underline"
                  >
                    {truncateAddress(txHash, 8, 6)} ↗
                  </a>
                </div>
              </div>

              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline"
              >
                <span>View on Sepolia Etherscan</span>
                <span>↗</span>
              </a>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                >
                  Close & Return
                </button>
              </div>
            </div>
          ) : (
            /* REVIEW & BROADCAST VIEW */
            <div className="space-y-4">
              {/* Amount Hero */}
              <div className="text-center py-3 bg-gradient-to-b from-orange-50/50 to-amber-50/30 rounded-2xl border border-orange-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Transfer Amount
                </span>
                <div className="text-3xl font-black font-mono text-slate-900 mt-1">
                  {transferAmount || "0"}{" "}
                  <span className="text-base font-bold text-orange-600">ETH</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  on Sepolia Testnet
                </span>
              </div>

              {/* Transaction Details Card */}
              <div className="space-y-2 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                {/* From */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">From</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 font-mono block">
                      {displayName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {truncateAddress(account, 6, 4)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 my-1.5" />

                {/* To */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">To (Recipient)</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 font-mono text-xs">
                      {truncateAddress(trimmedRecipient, 6, 4)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium block">
                      ✓ Valid Sepolia Address
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 my-1.5" />

                {/* Smart Contract */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Smart Contract</span>
                  <span className="font-mono font-bold text-slate-700 text-xs">
                    TransferDApp ({truncateAddress(contractAddress, 4, 3)})
                  </span>
                </div>

                <div className="border-t border-slate-200/60 my-1.5" />

                {/* Signer Private Key */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Signer Private Key</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-700 text-xs">
                      {showTransferConfirmKey
                        ? truncateAddress(selectedAccountPrivateKey, 8, 6)
                        : "••••••••••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTransferConfirmKey(!showTransferConfirmKey)}
                      className="text-[10px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 cursor-pointer"
                    >
                      {showTransferConfirmKey ? "Hide" : "Show Key"}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 my-1.5" />

                {/* Estimated Gas */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Estimated Network Fee</span>
                  <span className="font-mono text-slate-700 font-medium">
                    ~0.00008 ETH
                  </span>
                </div>

                <div className="border-t border-slate-200/60 my-1.5" />

                {/* Max Total */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="font-bold text-slate-900">Total Deducted</span>
                  <span className="font-bold font-mono text-slate-900">
                    {(parseFloat(transferAmount || "0") + 0.00008).toFixed(5)} ETH
                  </span>
                </div>
              </div>

              {/* Signer Notice Banner */}
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">⚡</span>
                <div className="text-[11px] text-purple-950 leading-relaxed">
                  {walletType === "in_app" ||
                  Boolean(
                    getStoredInAppWallets().some(
                      (w) => w.address.toLowerCase() === account.toLowerCase()
                    )
                  ) ? (
                    <>
                      <strong>Frontend Signing Mode:</strong> This transaction will be signed and broadcasted directly on this frontend via Sepolia RPC. <strong>No MetaMask extension popup will appear.</strong>
                    </>
                  ) : (
                    <>
                      <strong>MetaMask Signer:</strong> If you registered this account on our frontend, paste its private key below to sign 100% on the frontend without any MetaMask popup. Otherwise, confirm will proceed via MetaMask.
                    </>
                  )}
                </div>
              </div>

              {/* Optional: Paste Key for Frontend Signing if connected via MetaMask without saved key */}
              {walletType === "metamask" &&
                !getStoredInAppWallets().some(
                  (w) => w.address.toLowerCase() === account.toLowerCase()
                ) && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowFrontendKeyPrompt(!showFrontendKeyPrompt)}
                      className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>🔑</span>
                        <span>Sign on frontend with private key (Skip MetaMask popup)</span>
                      </span>
                      <span>{showFrontendKeyPrompt ? "▲ Hide" : "▼ Enter Key"}</span>
                    </button>

                    {showFrontendKeyPrompt && (
                      <div className="pt-1.5 space-y-1.5">
                        <input
                          type="password"
                          placeholder="Paste 64-character private key (0x...)..."
                          value={frontendSignerKeyInput}
                          onChange={(e) => setFrontendSignerKeyInput(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          Enables instant frontend signing without opening the MetaMask browser extension.
                        </span>
                      </div>
                    )}
                  </div>
                )}

              {/* Broadcasting / Confirming Progress Indicators */}
              {isTransferring && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>
                      {transferStatus === "confirming"
                        ? "Waiting for block confirmation on Sepolia..."
                        : "Broadcasting transaction to Sepolia Testnet..."}
                    </span>
                  </div>
                  {txHash && (
                    <p className="text-[10px] font-mono text-blue-700 truncate">
                      Tx: {txHash}
                    </p>
                  )}
                </div>
              )}

              {/* Error in Confirmation Modal */}
              {transferStatus === "error" && transferErrorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <span className="font-bold">⚠️</span>
                  <p className="flex-1 leading-relaxed">{transferErrorMessage}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isTransferring}
                  className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  Cancel / Edit
                </button>
                <button
                  type="button"
                  onClick={onExecuteTransfer}
                  disabled={isTransferring}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-white shadow-lg shadow-orange-500/20 disabled:opacity-50 transition cursor-pointer text-center flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {isTransferring ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing on Frontend...</span>
                    </>
                  ) : (
                    <>
                      <span>✓ Confirm & Send Ether</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Runs on Sepolia Testnet</span>
          <span className="text-slate-500 font-medium">Smart Contract Transfer</span>
        </div>
      </div>
    </div>
  );
}

export default TransferConfirmModal;

