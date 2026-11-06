"use client";

import React, { FormEvent } from "react";
import { formatEthBalance, truncateAddress } from "../types/wallet";

interface TransferFormProps {
  walletType: "metamask" | "in_app" | null;
  balance: string;
  numericBalance: number;
  allAccounts: string[];
  account: string;
  onSelectAccount: (acc: string) => void;
  recipient: string;
  setRecipient: (val: string) => void;
  isValidRecipient: boolean;
  isSelfTransfer: boolean;
  transferAmount: string;
  setTransferAmount: (val: string) => void;
  isValidAmount: boolean;
  numericAmount: number;
  canTransfer: boolean;
  isTransferring: boolean;
  transferStatus: "idle" | "broadcasting" | "confirming" | "success" | "error";
  txHash: string;
  transferErrorMessage: string;
  contractAddress: string;
  onPasteRecipient: () => void;
  onSetMaxAmount: () => void;
  onSubmit: (e: FormEvent) => void;
}

export function TransferForm({
  walletType,
  balance,
  numericBalance,
  allAccounts,
  account,
  onSelectAccount,
  recipient,
  setRecipient,
  isValidRecipient,
  isSelfTransfer,
  transferAmount,
  setTransferAmount,
  isValidAmount,
  numericAmount,
  canTransfer,
  isTransferring,
  transferStatus,
  txHash,
  transferErrorMessage,
  contractAddress,
  onPasteRecipient,
  onSetMaxAmount,
  onSubmit,
}: TransferFormProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Send Ether
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">
            Signed via {walletType === "in_app" ? "Frontend Browser Signer" : "MetaMask Signer"}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-medium block">
            Available Balance
          </span>
          <span className="text-xs font-bold font-mono text-emerald-700">
            {formatEthBalance(balance)} ETH
          </span>
        </div>
      </div>

      {/* Account Quick Switcher when multiple accounts are connected */}
      {allAccounts.length > 1 && (
        <div className="mb-4 p-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-600 pl-1">
            From Account:
          </span>
          <select
            value={account}
            onChange={(e) => onSelectAccount(e.target.value)}
            className="text-xs font-mono font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:border-orange-500 shadow-2xs"
          >
            {allAccounts.map((acc, idx) => (
              <option key={acc} value={acc}>
                Account {idx + 1}: {truncateAddress(acc, 6, 4)}
              </option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Recipient Address */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="recipient" className="text-xs font-bold text-slate-700">
              Recipient Address
            </label>
            <button
              type="button"
              onClick={onPasteRecipient}
              className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
            >
              Paste
            </button>
          </div>

          <div className="relative">
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              disabled={isTransferring}
              className={`w-full rounded-2xl border px-3.5 py-3 text-xs sm:text-sm font-mono transition outline-none focus:ring-2 ${
                recipient && !isValidRecipient
                  ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 bg-slate-50/60 focus:border-orange-500 focus:ring-orange-100 focus:bg-white"
              }`}
            />
          </div>

          {recipient && (
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span
                className={
                  isValidRecipient
                    ? isSelfTransfer
                      ? "text-amber-600 font-medium"
                      : "text-emerald-600 font-medium"
                    : "text-red-500 font-medium"
                }
              >
                {isValidRecipient
                  ? isSelfTransfer
                    ? "⚠️ Sending to your own address"
                    : "✓ Valid recipient address"
                  : "Invalid 0x Ethereum address"}
              </span>
            </div>
          )}
        </div>

        {/* Transfer Amount */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="amount" className="text-xs font-bold text-slate-700">
              Amount
            </label>
            <button
              type="button"
              onClick={onSetMaxAmount}
              disabled={isTransferring || numericBalance <= 0}
              className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold cursor-pointer disabled:opacity-40"
            >
              Max (Reserve Gas)
            </button>
          </div>

          <div className="relative">
            <input
              id="amount"
              type="number"
              step="any"
              min="0"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0.0"
              disabled={isTransferring}
              className={`w-full rounded-2xl border px-3.5 py-3 pr-16 text-lg font-bold font-mono transition outline-none focus:ring-2 ${
                transferAmount && !isValidAmount
                  ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 bg-slate-50/60 focus:border-orange-500 focus:ring-orange-100 focus:bg-white"
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 pointer-events-none">
              ETH
            </span>
          </div>

          {/* Quick Amount Pills */}
          <div className="mt-2 flex items-center gap-1.5">
            {["0.001", "0.005", "0.01"].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setTransferAmount(val)}
                disabled={isTransferring}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono font-medium text-slate-700 transition cursor-pointer"
              >
                +{val}
              </button>
            ))}
          </div>

          {transferAmount && !isValidAmount && (
            <p className="mt-1.5 text-[11px] text-red-500 font-medium">
              {numericAmount <= 0
                ? "Amount must be greater than 0"
                : "Amount exceeds your available balance"}
            </p>
          )}
        </div>

        {/* Contract Badge */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] font-medium">Smart Contract</span>
          <a
            href={`https://sepolia.etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-orange-600 hover:underline text-[11px] flex items-center gap-1"
          >
            <span>{truncateAddress(contractAddress, 6, 4)}</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canTransfer}
          className="w-full rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-3.5 px-4 font-bold text-white shadow-lg shadow-orange-500/20 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>
            Review & Confirm Transfer {transferAmount ? `(${transferAmount} ETH)` : ""} ↗
          </span>
        </button>
      </form>

      {/* Status Banners */}
      {transferStatus === "confirming" && txHash && (
        <div className="mt-4 rounded-2xl bg-blue-50/80 border border-blue-200 p-4 text-xs text-blue-900 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Transaction Broadcasted</span>
          </div>
          <p className="text-[11px] text-blue-700">
            Waiting for block confirmation on Sepolia...
          </p>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] font-mono font-bold text-blue-700 underline pt-1"
          >
            View on Sepolia Etherscan ↗
          </a>
        </div>
      )}

      {/* Success Banner */}
      {transferStatus === "success" && txHash && (
        <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-sm">
            <span>✓</span>
            <span>Transfer Successful!</span>
          </div>
          <p className="text-[11px] text-emerald-700">
            Your Ether was transferred and balance has updated.
          </p>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] font-mono font-bold text-emerald-900 underline pt-1"
          >
            View on Sepolia Etherscan ↗
          </a>
        </div>
      )}

      {/* Error Banner */}
      {transferStatus === "error" && transferErrorMessage && (
        <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 flex items-start gap-2">
          <span className="font-bold">⚠️</span>
          <p className="flex-1 leading-relaxed">{transferErrorMessage}</p>
        </div>
      )}
    </div>
  );
}

export default TransferForm;

