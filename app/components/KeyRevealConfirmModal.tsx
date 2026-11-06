"use client";

import React from "react";
import { truncateAddress } from "../types/wallet";

interface KeyRevealConfirmModalProps {
  isOpen: boolean;
  account: string;
  accountIndex: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function KeyRevealConfirmModal({
  isOpen,
  account,
  accountIndex,
  onClose,
  onConfirm,
}: KeyRevealConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-base">
              ⚠️
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Confirm Show Private Key
              </h3>
              <span className="text-[10px] text-red-600 font-semibold tracking-wider uppercase block">
                Security Confirmation
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-red-800">
              <span>🚨</span>
              <span>Never share this private key with anyone!</span>
            </div>
            <p className="text-[11px] text-red-700 leading-relaxed">
              Anyone who sees this private key will have complete access and control of{" "}
              <strong>Account {accountIndex + 1}</strong>. Please confirm nobody is watching your screen.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">
              Selected Account
            </span>
            <span className="font-bold text-slate-900 block font-mono">
              Account {accountIndex + 1}: {truncateAddress(account, 6, 4)}
            </span>
            <span className="text-[10px] font-mono text-slate-500 break-all select-all block">
              {account}
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-sm transition cursor-pointer flex items-center gap-1.5"
          >
            <span>👁️</span>
            <span>Confirm & Show Private Key</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default KeyRevealConfirmModal;

