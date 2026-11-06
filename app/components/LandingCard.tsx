"use client";

import React from "react";
import { truncateAddress } from "../types/wallet";

interface LandingCardProps {
  isLoading: boolean;
  hasMetaMask: boolean;
  hasSavedInAppWallets: boolean;
  contractAddress: string;
  onConnectMetaMask: () => void;
  onReconnectSavedInApp: () => void;
  onLoadExampleAccounts: () => void;
  onOpenImportModal: () => void;
}

export function LandingCard({
  isLoading,
  hasMetaMask,
  hasSavedInAppWallets,
  contractAddress,
  onConnectMetaMask,
  onReconnectSavedInApp,
  onLoadExampleAccounts,
  onOpenImportModal,
}: LandingCardProps) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 text-3xl font-extrabold text-white">
          ⚡
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Wallet Transfer DApp
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
          Send Sepolia ETH via smart contract. Connect your MetaMask extension or test with demo accounts.
        </p>
      </div>

      {/* Connection Choice Cards */}
      <div className="space-y-3 pt-1 text-left">
        {/* Primary Option: Connect MetaMask */}
        <button
          type="button"
          onClick={onConnectMetaMask}
          disabled={isLoading}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
              🦊
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                <span>Connect MetaMask</span>
                {hasMetaMask && (
                  <span className="text-[10px] bg-white text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Ready
                  </span>
                )}
              </div>
              <p suppressHydrationWarning className="text-[11px] text-white/90">
                {hasMetaMask
                  ? "MetaMask detected in browser • 1-click connect"
                  : "Connect via MetaMask extension • Sepolia Testnet"}
              </p>
            </div>
          </div>
          <span className="text-xl group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>

        {/* Reconnect Option if in-app wallets exist */}
        {hasSavedInAppWallets && (
          <button
            type="button"
            onClick={onReconnectSavedInApp}
            className="w-full p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 shadow-xs active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚡</span>
              <div className="text-left">
                <span className="font-bold text-xs block text-purple-950">
                  Reconnect Saved In-App Wallet
                </span>
                <span className="text-[10px] text-purple-700">
                  Resume previously saved browser wallet
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-1 rounded-xl border border-purple-200 shadow-2xs group-hover:bg-purple-600 group-hover:text-white transition">
              Reconnect ↗
            </span>
          </button>
        )}

        {/* Instant Demo: Load 3 Example Accounts with Fake Keys */}
        <button
          type="button"
          onClick={onLoadExampleAccounts}
          className="w-full p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200 text-amber-950 shadow-xs active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">🎭</span>
            <div className="text-left">
              <span className="font-bold text-xs block text-amber-950">
                Try 3 Example Accounts (Demo Mode)
              </span>
              <span className="text-[10px] text-amber-700">
                Test account switching & fake private keys instantly
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-white px-2.5 py-1 rounded-xl border border-amber-200 shadow-2xs group-hover:bg-amber-600 group-hover:text-white transition">
            Load Demo ↗
          </span>
        </button>

        {/* Tertiary Option: Import Private Key */}
        <button
          type="button"
          onClick={onOpenImportModal}
          className="w-full text-center py-2 text-xs font-semibold text-slate-500 hover:text-orange-600 transition cursor-pointer"
        >
          Already have a private key? Import wallet ↗
        </button>
      </div>

      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Smart Contract</span>
        <a
          href={`https://sepolia.etherscan.io/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-orange-600 font-bold hover:underline"
        >
          {truncateAddress(contractAddress, 6, 4)} ↗
        </a>
      </div>
    </div>
  );
}

export default LandingCard;

