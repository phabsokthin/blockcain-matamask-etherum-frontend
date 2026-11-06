"use client";

import React from "react";
import { Wallet } from "ethers";
import {
  formatEthBalance,
  truncateAddress,
  getStoredInAppWallets,
  downloadKeystoreJson,
} from "../types/wallet";

interface AccountViewProps {
  walletType: "metamask" | "in_app" | null;
  ensName: string | null;
  displayName: string;
  account: string;
  accountIndex: number;
  selectedAccountPrivateKey: string;
  showSelectedAccountKey: boolean;
  setShowSelectedAccountKey: (show: boolean) => void;
  onOpenKeyConfirmModal: () => void;
  balance: string;
  isLoading: boolean;
  onRefreshBalance: () => void;
  hasCopied: boolean;
  onCopyAddress: () => void;
  hasCopiedSelectedKey: boolean;
  setHasCopiedSelectedKey: (val: boolean) => void;
  hasCopiedSelectedKeyRaw: boolean;
  setHasCopiedSelectedKeyRaw: (val: boolean) => void;
  inAppWallet: Wallet | null;
  showExportedKey: boolean;
  setShowExportedKey: (val: boolean) => void;
  hasCopiedExportedKey: boolean;
  setHasCopiedExportedKey: (val: boolean) => void;
  hasCopiedExportedKeyRaw: boolean;
  setHasCopiedExportedKeyRaw: (val: boolean) => void;
  allAccounts: string[];
  onSelectAccount: (acc: string) => void;
  isSwitchingAccount: boolean;
  onSwitchAccount: () => void;
  onOpenRegisterModal: () => void;
  onDisconnect: () => void;
}

export function AccountView({
  walletType,
  ensName,
  displayName,
  account,
  accountIndex,
  selectedAccountPrivateKey,
  showSelectedAccountKey,
  setShowSelectedAccountKey,
  onOpenKeyConfirmModal,
  balance,
  isLoading,
  onRefreshBalance,
  hasCopied,
  onCopyAddress,
  hasCopiedSelectedKey,
  setHasCopiedSelectedKey,
  hasCopiedSelectedKeyRaw,
  setHasCopiedSelectedKeyRaw,
  inAppWallet,
  showExportedKey,
  setShowExportedKey,
  hasCopiedExportedKey,
  setHasCopiedExportedKey,
  hasCopiedExportedKeyRaw,
  setHasCopiedExportedKeyRaw,
  allAccounts,
  onSelectAccount,
  isSwitchingAccount,
  onSwitchAccount,
  onOpenRegisterModal,
  onDisconnect,
}: AccountViewProps) {
  return (
    <div className="space-y-4">
      {/* Account Identity Card */}
      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                walletType === "in_app"
                  ? "bg-gradient-to-tr from-purple-500 to-indigo-600"
                  : "bg-gradient-to-tr from-orange-400 to-amber-500"
              }`}
            >
              {walletType === "in_app"
                ? "⚡"
                : ensName
                ? ensName.slice(0, 2).toUpperCase()
                : `A${accountIndex + 1}`}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm">
                  {displayName}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500 block mt-0.5">
                {truncateAddress(account, 6, 4)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCopyAddress}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200 transition cursor-pointer"
          >
            {hasCopied ? "✓ Copied" : "Copy"}
          </button>
        </div>

        {/* Full Address */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-600 break-all select-all">
          {account}
        </div>

        {/* Private Key for Selected Account with Hide / Show Toggle */}
        <div className="mt-3 pt-3 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>🔐</span>
              <span>Private Key (Account {accountIndex + 1})</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (showSelectedAccountKey) {
                  setShowSelectedAccountKey(false);
                } else {
                  onOpenKeyConfirmModal();
                }
              }}
              className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-0.5 rounded-md transition cursor-pointer border border-purple-200"
            >
              {showSelectedAccountKey ? "Hide Key" : "Show Key"}
            </button>
          </div>

          <div className="space-y-2">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
              {showSelectedAccountKey
                ? selectedAccountPrivateKey
                : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
            </div>

            {showSelectedAccountKey && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-400">
                  Private key for selected Account {accountIndex + 1} ({truncateAddress(account, 6, 4)})
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!selectedAccountPrivateKey) return;
                      const raw = selectedAccountPrivateKey.replace(/^0x/, "");
                      await navigator.clipboard.writeText(raw);
                      setHasCopiedSelectedKeyRaw(true);
                      setTimeout(() => setHasCopiedSelectedKeyRaw(false), 2000);
                    }}
                    className="text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg cursor-pointer transition shadow-2xs"
                  >
                    {hasCopiedSelectedKeyRaw ? "✓ Copied 64-char" : "Copy (without 0x)"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!selectedAccountPrivateKey) return;
                      await navigator.clipboard.writeText(selectedAccountPrivateKey);
                      setHasCopiedSelectedKey(true);
                      setTimeout(() => setHasCopiedSelectedKey(false), 2000);
                    }}
                    className="text-[11px] font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-lg cursor-pointer transition"
                  >
                    {hasCopiedSelectedKey ? "✓ Copied Key" : "Copy (with 0x)"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance Display */}
      <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/80 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Sepolia ETH Balance
          </span>
          <span className="text-2xl font-extrabold text-emerald-950 font-mono tracking-tight">
            {formatEthBalance(balance)}{" "}
            <span className="text-sm font-bold text-emerald-700">ETH</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onRefreshBalance}
          disabled={isLoading}
          className="text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {/* Export Private Key & Download Keystore (In-App Wallet Only) */}
      {walletType === "in_app" && inAppWallet && (
        <div className="rounded-2xl bg-purple-50/60 p-4 border border-purple-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
              <span>🔐</span>
              <span>Account Keys & MetaMask Import</span>
            </div>
            <button
              type="button"
              onClick={() => setShowExportedKey(!showExportedKey)}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
            >
              {showExportedKey ? "Hide Keys" : "Reveal Keys"}
            </button>
          </div>

          {/* Keystore Download if saved */}
          {(() => {
            const storedWallets = getStoredInAppWallets();
            const currentEntry = storedWallets.find(
              (w) => w.address.toLowerCase() === account.toLowerCase()
            );
            if (currentEntry?.keystoreJson) {
              return (
                <div className="p-3 bg-white rounded-xl border border-purple-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-purple-950 block">
                      MetaMask Keystore File (.json)
                    </span>
                    <span className="text-[10px] text-purple-600 block">
                      Encrypted with your password. Import into MetaMask anytime.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      downloadKeystoreJson(account, currentEntry.keystoreJson!)
                    }
                    className="text-xs font-bold text-purple-800 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-xl border border-purple-300 transition cursor-pointer flex-shrink-0"
                  >
                    ⬇️ Download
                  </button>
                </div>
              );
            }
            return null;
          })()}

          {showExportedKey && (
            <div className="space-y-2 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-purple-200 font-mono text-[10px] text-purple-950 break-all select-all">
                {inAppWallet.privateKey}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-purple-700">
                  Tip: In MetaMask, paste 64-char key (without 0x) to avoid format errors.
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      const raw = inAppWallet.privateKey.replace(/^0x/, "");
                      await navigator.clipboard.writeText(raw);
                      setHasCopiedExportedKeyRaw(true);
                      setTimeout(() => setHasCopiedExportedKeyRaw(false), 2000);
                    }}
                    className="text-xs font-bold text-purple-800 bg-white hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg cursor-pointer transition shadow-2xs"
                  >
                    {hasCopiedExportedKeyRaw ? "✓ Copied 64-char" : "Copy (without 0x)"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(inAppWallet.privateKey);
                      setHasCopiedExportedKey(true);
                      setTimeout(() => setHasCopiedExportedKey(false), 2000);
                    }}
                    className="text-xs font-bold text-purple-800 bg-purple-100 hover:bg-purple-200 px-2.5 py-1 rounded-lg cursor-pointer transition"
                  >
                    {hasCopiedExportedKey ? "✓ Copied Key" : "Copy (with 0x)"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Switcher Header & Action */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800">
            Connected Accounts ({allAccounts.length})
          </span>
          <button
            type="button"
            onClick={() => {
              if (walletType === "in_app") {
                onOpenRegisterModal();
              } else {
                onSwitchAccount();
              }
            }}
            disabled={isSwitchingAccount}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            {walletType === "in_app"
              ? "+ Register / Import New"
              : isSwitchingAccount
              ? "Opening..."
              : "+ Connect / Switch Accounts in MetaMask"}
          </button>
        </div>

        {/* Quick Account 1, 2, 3 Selector Pills */}
        {allAccounts.length > 1 && (
          <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-0.5">
            {allAccounts.map((acc, index) => {
              const isCurrent = acc.toLowerCase() === account.toLowerCase();
              return (
                <button
                  key={acc}
                  type="button"
                  onClick={() => onSelectAccount(acc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border flex-shrink-0 ${
                    isCurrent
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  <span>Account {index + 1}</span>
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Clean Account List */}
        <div className="space-y-1.5">
          {allAccounts.map((acc, index) => {
            const isCurrent = acc.toLowerCase() === account.toLowerCase();

            return (
              <div
                key={acc}
                onClick={() => onSelectAccount(acc)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer border ${
                  isCurrent
                    ? "bg-emerald-50/90 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400 shadow-xs"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      isCurrent
                        ? "border-emerald-600 bg-emerald-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isCurrent && (
                      <span className="w-1 h-1 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="truncate">
                    Account {index + 1}: {truncateAddress(acc, 6, 4)}
                  </span>
                </div>

                {isCurrent ? (
                  <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold ml-2">
                    Active • Key Shown Above
                  </span>
                ) : (
                  <span className="text-[11px] text-blue-600 font-medium ml-2 hover:underline">
                    Select
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {walletType === "metamask" && allAccounts.length === 1 && (
          <p className="pt-2 text-[11px] text-slate-400 leading-relaxed">
            💡 Only 1 account is currently visible. Click <strong>+ Connect / Switch Accounts in MetaMask</strong> or open your MetaMask extension to grant access to other accounts.
          </p>
        )}
      </div>

      {/* Faucet Link when balance is low */}
      {parseFloat(balance) === 0 && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <p>
            Need test funds? Copy your address and request free Sepolia ETH from the faucet:
          </p>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onCopyAddress}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              {hasCopied ? "✓ Address Copied" : "Copy Active Address"}
            </button>
            <a
              href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-600 font-bold hover:underline"
            >
              Google Cloud Faucet ↗
            </a>
          </div>
        </div>
      )}

      {/* Disconnect & Logout Action Card */}
      <div className="pt-3 border-t border-slate-200/80 space-y-2">
        <button
          type="button"
          onClick={onDisconnect}
          className="w-full py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.99]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Log Out & Clear DApp Storage</span>
        </button>
        <p className="text-[11px] text-slate-400 text-center">
          Disconnects active session and wipes browser storage.
        </p>
      </div>
    </div>
  );
}

export default AccountView;

