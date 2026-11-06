"use client";

import React from "react";

interface WalletModalProps {
  isOpen: boolean;
  importKeyInput: string;
  setImportKeyInput: (val: string) => void;
  importError: string;
  setImportError: (val: string) => void;
  onClose: () => void;
  onImportPrivateKey: () => void;
  onLoadExampleAccounts: () => void;
}

export function WalletModal({
  isOpen,
  importKeyInput,
  setImportKeyInput,
  importError,
  setImportError,
  onClose,
  onImportPrivateKey,
  onLoadExampleAccounts,
}: WalletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔑</span>
            <h3 className="font-extrabold text-base text-slate-900">
              Import Private Key
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label htmlFor="importKey" className="font-bold text-slate-700 block mb-1">
              Private Key (32-byte hex)
            </label>
            <input
              id="importKey"
              type="password"
              placeholder="0x..."
              value={importKeyInput}
              onChange={(e) => {
                setImportKeyInput(e.target.value);
                setImportError("");
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Enter a valid 64-character private key (with or without 0x).
            </span>
          </div>

          {importError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px] flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{importError}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onImportPrivateKey}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-bold text-white shadow-md shadow-orange-500/20 transition cursor-pointer text-center"
            >
              Import & Connect
            </button>

            <button
              type="button"
              onClick={onLoadExampleAccounts}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer text-center"
            >
              ⚡ Or load 3 Example Demo Accounts ↗
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Runs on Sepolia Testnet</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 font-semibold hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletModal;
