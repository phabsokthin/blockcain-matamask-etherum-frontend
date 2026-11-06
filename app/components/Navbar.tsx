"use client";

import React from "react";
import { formatEthBalance, truncateAddress } from "../types/wallet";

interface NavbarProps {
  isConnected: boolean;
  walletType: "metamask" | "in_app" | null;
  isSepolia: boolean;
  balance: string;
  account: string;
  displayName: string;
  activeTab: "transfer" | "account";
  isLoading: boolean;
  hasMetaMask: boolean;
  onConnectMetaMask: () => void;
  onToggleTab: (tab: "transfer" | "account") => void;
  onDisconnect: () => void;
}

export function Navbar({
  isConnected,
  walletType,
  isSepolia,
  balance,
  account,
  displayName,
  activeTab,
  isLoading,
  onConnectMetaMask,
  onToggleTab,
  onDisconnect,
}: NavbarProps) {
  return (
    <nav className="w-full max-w-6xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between border-b border-slate-200/80">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center shadow-md shadow-orange-500/20">
          <span className="text-white font-black text-lg">⚡</span>
        </div>
        <div>
          <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
            Transfer<span className="text-orange-600">DApp</span>
          </span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
            Sepolia Testnet
          </span>
        </div>
      </div>

      {/* Right Nav Action */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Wallet Type Badge */}
        {isConnected && (
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              walletType === "in_app"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <span>{walletType === "in_app" ? "⚡ Frontend Wallet" : "🦊 MetaMask"}</span>
          </div>
        )}

        {/* Network Pill */}
        {isConnected && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                isSepolia ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{isSepolia ? "Sepolia" : "Wrong Network"}</span>
          </div>
        )}

        {/* Connect / Account Pill */}
        {!isConnected ? (
          <button
            type="button"
            onClick={onConnectMetaMask}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>Connect MetaMask</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-full pl-3 pr-1 py-1 shadow-xs">
              <span className="text-xs font-bold font-mono text-slate-700 mr-2 hidden md:inline">
                {formatEthBalance(balance)} ETH
              </span>
              <button
                type="button"
                onClick={() => onToggleTab(activeTab === "account" ? "transfer" : "account")}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{displayName}</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {truncateAddress(account, 4, 3)}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onDisconnect}
              title="Disconnect / Log out wallet"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-xs font-semibold text-slate-600 hover:text-red-600 transition cursor-pointer shadow-xs active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

