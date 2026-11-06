"use client";

import React, { FormEvent } from "react";
import { DraftWalletInfo, downloadKeystoreJson } from "../types/wallet";

interface WalletModalProps {
  isOpen: boolean;
  modalTab: "register" | "import" | "metamask";
  setModalTab: (tab: "register" | "import" | "metamask") => void;
  modalNotice: string;
  regStep: "password" | "ready";
  setRegStep: (step: "password" | "ready") => void;
  regPassword: string;
  setRegPassword: (val: string) => void;
  regConfirmPassword: string;
  setRegConfirmPassword: (val: string) => void;
  showRegPassword: boolean;
  setShowRegPassword: (val: boolean) => void;
  regPasswordError: string;
  setRegPasswordError: (val: string) => void;
  isEncrypting: boolean;
  draftWallet: DraftWalletInfo | null;
  setDraftWallet: (wallet: DraftWalletInfo | null) => void;
  hasDownloadedKeystore: boolean;
  setHasDownloadedKeystore: (val: boolean) => void;
  hasBackedUpKey: boolean;
  setHasBackedUpKey: (val: boolean) => void;
  showDraftPrivateKey: boolean;
  setShowDraftPrivateKey: (val: boolean) => void;
  hasCopiedDraftAddress: boolean;
  setHasCopiedDraftAddress: (val: boolean) => void;
  hasCopiedDraftKey: boolean;
  setHasCopiedDraftKey: (val: boolean) => void;
  hasCopiedDraftKeyRaw: boolean;
  setHasCopiedDraftKeyRaw: (val: boolean) => void;
  hasCopiedDraftSeed: boolean;
  setHasCopiedDraftSeed: (val: boolean) => void;
  hasCopiedPassword: boolean;
  setHasCopiedPassword: (val: boolean) => void;
  showAlternativeBackup: boolean;
  setShowAlternativeBackup: (val: boolean) => void;
  importMode: "key" | "keystore";
  setImportMode: (mode: "key" | "keystore") => void;
  importKeyInput: string;
  setImportKeyInput: (val: string) => void;
  importKeystoreInput: string;
  setImportKeystoreInput: (val: string) => void;
  importPasswordInput: string;
  setImportPasswordInput: (val: string) => void;
  importError: string;
  setImportError: (val: string) => void;
  isLoading: boolean;
  hasMetaMask: boolean;
  onClose: () => void;
  onGenerateWalletWithPassword: (e: FormEvent) => void;
  onLoadExampleAccounts: () => void;
  onConfirmRegisterInAppWallet: () => void;
  onImportPrivateKey: () => void;
  onImportKeystore: () => void;
  onConnectMetaMask: () => void;
}

export function WalletModal({
  isOpen,
  modalTab,
  setModalTab,
  modalNotice,
  regStep,
  setRegStep,
  regPassword,
  setRegPassword,
  regConfirmPassword,
  setRegConfirmPassword,
  showRegPassword,
  setShowRegPassword,
  regPasswordError,
  setRegPasswordError,
  isEncrypting,
  draftWallet,
  setDraftWallet,
  hasDownloadedKeystore,
  setHasDownloadedKeystore,
  hasBackedUpKey,
  setHasBackedUpKey,
  showDraftPrivateKey,
  setShowDraftPrivateKey,
  hasCopiedDraftAddress,
  setHasCopiedDraftAddress,
  hasCopiedDraftKey,
  setHasCopiedDraftKey,
  hasCopiedDraftKeyRaw,
  setHasCopiedDraftKeyRaw,
  hasCopiedDraftSeed,
  setHasCopiedDraftSeed,
  hasCopiedPassword,
  setHasCopiedPassword,
  showAlternativeBackup,
  setShowAlternativeBackup,
  importMode,
  setImportMode,
  importKeyInput,
  setImportKeyInput,
  importKeystoreInput,
  setImportKeystoreInput,
  importPasswordInput,
  setImportPasswordInput,
  importError,
  setImportError,
  isLoading,
  hasMetaMask,
  onClose,
  onGenerateWalletWithPassword,
  onLoadExampleAccounts,
  onConfirmRegisterInAppWallet,
  onImportPrivateKey,
  onImportKeystore,
  onConnectMetaMask,
}: WalletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="font-extrabold text-base text-slate-900">
              Wallet Setup & Registration
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

        {/* Modal Notification banner if opened due to missing MetaMask */}
        {modalNotice && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-xs text-amber-900 flex items-start gap-2">
            <span className="text-base flex-shrink-0">ℹ️</span>
            <p className="leading-relaxed">{modalNotice}</p>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex items-center p-2 bg-slate-100 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setModalTab("register")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              modalTab === "register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            ⚡ Register with Password
          </button>
          <button
            type="button"
            onClick={() => setModalTab("import")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              modalTab === "import"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🔑 Import (Key / Keystore)
          </button>
          <button
            type="button"
            onClick={() => setModalTab("metamask")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              modalTab === "metamask"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🦊 MetaMask
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: REGISTER WITH PASSWORD & METAMASK KEYSTORE */}
          {modalTab === "register" && regStep === "password" && (
            <form onSubmit={onGenerateWalletWithPassword} className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-purple-950">
                <div className="font-extrabold text-sm mb-1 flex items-center gap-1.5">
                  <span>🔐</span>
                  <span>Register New Account with Password</span>
                </div>
                <p className="text-[11px] text-purple-700 leading-relaxed">
                  Choose a password to encrypt your new Ethereum account into standard Keystore V3 format. You can use this password to import into MetaMask, or sign directly in this dApp.
                </p>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="regPass" className="font-bold text-slate-700 block mb-1">
                  Set Account Password
                </label>
                <div className="relative">
                  <input
                    id="regPass"
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      setRegPasswordError("");
                    }}
                    placeholder="Enter password (minimum 6 characters)..."
                    disabled={isEncrypting}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-14 text-xs font-mono outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer px-1 py-0.5"
                  >
                    {showRegPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Used to unlock your Keystore file when logging in or importing into MetaMask.
                </span>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="regConfirm" className="font-bold text-slate-700 block mb-1">
                  Confirm Password
                </label>
                <input
                  id="regConfirm"
                  type={showRegPassword ? "text" : "password"}
                  value={regConfirmPassword}
                  onChange={(e) => {
                    setRegConfirmPassword(e.target.value);
                    setRegPasswordError("");
                  }}
                  placeholder="Re-type your password..."
                  disabled={isEncrypting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* Error Alert */}
              {regPasswordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px] flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>{regPasswordError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isEncrypting ||
                  !regPassword ||
                  regPassword.length < 6 ||
                  regPassword !== regConfirmPassword
                }
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 font-bold text-white shadow-md shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {isEncrypting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating & Encrypting Keystore...</span>
                  </>
                ) : (
                  <>
                    <span>🔐 Generate & Encrypt Account</span>
                  </>
                )}
              </button>

              {/* Instant Demo Option */}
              <div className="pt-2 border-t border-slate-200/80 text-center">
                <button
                  type="button"
                  onClick={onLoadExampleAccounts}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
                >
                  ⚡ Or load 3 Example Demo Accounts instantly (with Fake Keys) ↗
                </button>
              </div>
            </form>
          )}

          {/* TAB 1 - STEP 2: ACCOUNT READY & METAMASK IMPORT */}
          {modalTab === "register" && regStep === "ready" && draftWallet && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-emerald-900">
                <div className="font-extrabold text-sm mb-1 flex items-center gap-1.5">
                  <span>🎉</span>
                  <span>Account Created & Encrypted with Password!</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Your account is encrypted into standard MetaMask Keystore V3 format. Download your Keystore JSON below and import it into MetaMask using your password!
                </p>
              </div>

              {/* Public Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700">Account Public Address</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(draftWallet.address);
                      setHasCopiedDraftAddress(true);
                      setTimeout(() => setHasCopiedDraftAddress(false), 2000);
                    }}
                    className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    {hasCopiedDraftAddress ? "✓ Copied" : "Copy Address"}
                  </button>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
                  {draftWallet.address}
                </div>
              </div>

              {/* Chosen Password */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-950 flex items-center gap-1">
                    <span>🔑</span>
                    <span>Your Password for MetaMask Login</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 cursor-pointer"
                    >
                      {showRegPassword ? "Hide" : "Reveal"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (draftWallet.password) {
                          await navigator.clipboard.writeText(draftWallet.password);
                          setHasCopiedPassword(true);
                          setTimeout(() => setHasCopiedPassword(false), 2000);
                        }
                      }}
                      className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 cursor-pointer"
                    >
                      {hasCopiedPassword ? "✓ Copied" : "Copy Password"}
                    </button>
                  </div>
                </div>
                <div className="bg-white px-2.5 py-1.5 rounded-xl border border-amber-200 font-mono text-xs text-amber-950">
                  {showRegPassword ? draftWallet.password : "••••••••••••••••"}
                </div>
                <span className="text-[10px] text-amber-800 block">
                  Enter this password when importing the Keystore file into MetaMask.
                </span>
              </div>

              {/* Highlighted MetaMask Keystore Download */}
              {draftWallet.keystoreJson && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border border-orange-200 space-y-2.5">
                  <div>
                    <div className="font-extrabold text-xs text-orange-950 flex items-center gap-1.5">
                      <span>🦊</span>
                      <span>MetaMask Keystore JSON File</span>
                    </div>
                    <p className="text-[11px] text-orange-800 mt-0.5 leading-snug">
                      Standard Web3 Secret Storage file (V3). Import into MetaMask with your password.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      downloadKeystoreJson(draftWallet.address, draftWallet.keystoreJson!);
                      setHasDownloadedKeystore(true);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                      hasDownloadedKeystore
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-orange-600 hover:bg-orange-700 text-white"
                    }`}
                  >
                    <span>{hasDownloadedKeystore ? "✓" : "⬇️"}</span>
                    <span>
                      {hasDownloadedKeystore
                        ? "Keystore File Downloaded (Click to download again)"
                        : "Download MetaMask Keystore File (.json)"}
                    </span>
                  </button>
                </div>
              )}

              {/* Step-by-Step Instructions: How to import into MetaMask */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-2.5">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <span>🦊</span>
                  <span>How to Import into MetaMask (Avoid SeedlessOnboarding Error):</span>
                </span>

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-snug">
                  <strong>⚠️ Important:</strong> Do NOT paste private keys on MetaMask&apos;s initial Welcome/Install screen (&quot;Import an existing wallet&quot;), which only accepts 12-word recovery phrases. Pasting a private key there triggers the <em>SeedlessOnboardingController</em> error.
                </div>

                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                  <li>
                    <strong>If MetaMask is already installed &amp; unlocked:</strong>
                    <div className="pl-4 pt-0.5 text-slate-500">
                      Click your account avatar at top &rarr; <strong>&quot;Add account or hardware wallet&quot;</strong> &rarr; <strong>&quot;Import account&quot;</strong>. Choose <strong>&quot;JSON File&quot;</strong> (with your password) or <strong>&quot;Private Key&quot;</strong> (paste without 0x).
                    </div>
                  </li>
                  <li>
                    <strong>If on MetaMask&apos;s Initial Welcome Setup screen:</strong>
                    <div className="pl-4 pt-0.5 text-slate-500">
                      Click <strong>&quot;Import an existing wallet&quot;</strong> and paste the <strong>12-Word Recovery Seed Phrase</strong> below (not the private key string!).
                    </div>
                  </li>
                </ol>
              </div>

              {/* Collapsible Alternative: Raw Private Key & Seed Phrase */}
              <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowAlternativeBackup(!showAlternativeBackup)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>🔑</span>
                    <span>Alternative: Raw Private Key &amp; 12-Word Seed Phrase</span>
                  </span>
                  <span>{showAlternativeBackup ? "▲ Hide" : "▼ Show"}</span>
                </button>

                {showAlternativeBackup && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-700">Raw Private Key</span>
                        <button
                          type="button"
                          onClick={() => setShowDraftPrivateKey(!showDraftPrivateKey)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          {showDraftPrivateKey ? "Hide" : "Reveal"}
                        </button>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
                        {showDraftPrivateKey
                          ? draftWallet.privateKey
                          : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                      </div>

                      {/* Dual Copy Buttons: with 0x and without 0x */}
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[10px] text-purple-700">
                          Tip: Paste the 64-char key (without 0x) in MetaMask to avoid format errors.
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={async () => {
                              const raw = draftWallet.privateKey.replace(/^0x/, "");
                              await navigator.clipboard.writeText(raw);
                              setHasCopiedDraftKeyRaw(true);
                              setTimeout(() => setHasCopiedDraftKeyRaw(false), 2000);
                            }}
                            className="text-xs font-bold text-purple-800 bg-white hover:bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg cursor-pointer transition shadow-2xs"
                          >
                            {hasCopiedDraftKeyRaw ? "✓ Copied 64-char" : "Copy (without 0x)"}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await navigator.clipboard.writeText(draftWallet.privateKey);
                              setHasCopiedDraftKey(true);
                              setTimeout(() => setHasCopiedDraftKey(false), 2000);
                            }}
                            className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-lg cursor-pointer transition"
                          >
                            {hasCopiedDraftKey ? "✓ Copied Key" : "Copy (with 0x)"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {draftWallet.mnemonic && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-700">12-Word Seed Phrase</span>
                          <button
                            type="button"
                            onClick={async () => {
                              if (draftWallet.mnemonic) {
                                await navigator.clipboard.writeText(draftWallet.mnemonic);
                                setHasCopiedDraftSeed(true);
                                setTimeout(() => setHasCopiedDraftSeed(false), 2000);
                              }
                            }}
                            className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                          >
                            {hasCopiedDraftSeed ? "✓ Copied" : "Copy Phrase"}
                          </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                          {draftWallet.mnemonic.split(" ").map((word, idx) => (
                            <div
                              key={idx}
                              className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700 font-mono text-[10px] flex items-center justify-between"
                            >
                              <span className="text-slate-400 mr-1">{idx + 1}.</span>
                              <span className="font-bold">{word}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Backup Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasBackedUpKey}
                  onChange={(e) => setHasBackedUpKey(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <span className="text-[11px] text-amber-900 leading-tight">
                  I have saved my password and downloaded my Keystore file / backed up my key. I understand I need this password to import into MetaMask.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRegStep("password");
                    setRegPassword("");
                    setRegConfirmPassword("");
                    setDraftWallet(null);
                  }}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
                >
                  Create Another
                </button>
                <button
                  type="button"
                  onClick={onConfirmRegisterInAppWallet}
                  disabled={!hasBackedUpKey}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-bold text-white shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-center"
                >
                  Register & Connect to DApp Now
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT WALLET (KEY OR KEYSTORE JSON) */}
          {modalTab === "import" && (
            <div className="space-y-4">
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setImportMode("key");
                    setImportError("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    importMode === "key"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Private Key
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportMode("keystore");
                    setImportError("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    importMode === "keystore"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Keystore JSON + Password
                </button>
              </div>

              {importMode === "key" ? (
                <div className="space-y-3">
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
                  </div>

                  {importError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px]">
                      {importError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={onImportPrivateKey}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-bold text-white shadow-md shadow-orange-500/20 transition cursor-pointer"
                  >
                    Import & Connect
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="importKeystore" className="font-bold text-slate-700 block mb-1">
                      Keystore JSON Content
                    </label>
                    <textarea
                      id="importKeystore"
                      rows={4}
                      placeholder='{"address": "...", "crypto": { ... }}'
                      value={importKeystoreInput}
                      onChange={(e) => {
                        setImportKeystoreInput(e.target.value);
                        setImportError("");
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-[11px] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="importPass" className="font-bold text-slate-700 block mb-1">
                      Password
                    </label>
                    <input
                      id="importPass"
                      type="password"
                      placeholder="Enter password used to encrypt this file..."
                      value={importPasswordInput}
                      onChange={(e) => {
                        setImportPasswordInput(e.target.value);
                        setImportError("");
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  {importError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px]">
                      {importError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={onImportKeystore}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-bold text-white shadow-md shadow-purple-500/20 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Decrypting...</span>
                      </>
                    ) : (
                      <span>Decrypt & Connect</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: METAMASK EXTENSION */}
          {modalTab === "metamask" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                  MetaMask Browser Extension
                </h4>
                <p className="text-[11px] text-slate-500">
                  Connect through your installed MetaMask browser extension.
                </p>
              </div>

              {hasMetaMask ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <span>✓</span>
                    <span>MetaMask Extension Detected</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Click below to open MetaMask and authorize connection to this dApp.
                  </p>
                  <button
                    type="button"
                    onClick={onConnectMetaMask}
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-white transition cursor-pointer"
                  >
                    {isLoading ? "Connecting..." : "Connect MetaMask Extension"}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <span>⚠️</span>
                    <span>MetaMask Extension Not Found</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    MetaMask is not installed or enabled in this browser. You do not need to install it &mdash; you can register an in-app wallet directly on the frontend!
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalTab("register")}
                    className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-white transition cursor-pointer"
                  >
                    ⚡ Switch to Register In-App Wallet
                  </button>
                  <div className="text-center pt-1">
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-500 hover:underline"
                    >
                      Or install MetaMask from metamask.io ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
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

