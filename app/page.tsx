"use client";

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  FormEvent,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import { BrowserProvider, formatEther, isAddress, Wallet } from "ethers";
import { CONTRACT_ADDRESS, getSepoliaJsonRpcProvider } from "./lib/contract";
import { sendETH } from "./lib/contractActions";
import {
  EthereumRpcError,
  PRIVATE_KEY,
  SEPOLIA_CONFIG,
  STORAGE_KEY_ACTIVE_ADDR,
  STORAGE_KEY_DISCONNECTED,
  clearInAppWalletsFromStorage,
  getAllMetaMaskAccounts,
  getPrivateKeyForAddress,
  getStoredInAppWallets,
  parseWalletError,
  saveInAppWalletToStorage,
  setActiveInAppWalletAddress,
  subscribeMetaMask,
  subscribeStorage,
} from "./types/wallet";

import Navbar from "./components/Navbar";
import LandingCard from "./components/LandingCard";
import TransferForm from "./components/TransferForm";
import AccountView from "./components/AccountView";

// Dynamic Modal Components (Client-side dynamic import)
const TransferConfirmModal = dynamic(
  () => import("./components/TransferConfirmModal"),
  { ssr: false }
);
const KeyRevealConfirmModal = dynamic(
  () => import("./components/KeyRevealConfirmModal"),
  { ssr: false }
);
const WalletModal = dynamic(
  () => import("./components/WalletModal"),
  { ssr: false }
);

export default function Home() {
  // Check if MetaMask is available without hydration mismatch
  const hasMetaMask = useSyncExternalStore(
    subscribeMetaMask,
    () => Boolean(typeof window !== "undefined" && window.ethereum),
    () => false
  );

  // Check if saved in-app wallets exist in browser storage
  const hasSavedInAppWallets = useSyncExternalStore(
    subscribeStorage,
    () => Boolean(typeof window !== "undefined" && getStoredInAppWallets().length > 0),
    () => false
  );

  // Wallet Connection State
  const [account, setAccount] = useState<string>("");
  const [allAccounts, setAllAccounts] = useState<string[]>([]);
  const [walletType, setWalletType] = useState<"metamask" | "in_app" | null>(null);
  const [inAppWallet, setInAppWallet] = useState<Wallet | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [chainId, setChainId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState<boolean>(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [logoutNotice, setLogoutNotice] = useState<string>("");
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Tab State: "transfer" or "account"
  const [activeTab, setActiveTab] = useState<"transfer" | "account">("transfer");

  // Transfer Form State
  const [recipient, setRecipient] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferStatus, setTransferStatus] = useState<
    "idle" | "broadcasting" | "confirming" | "success" | "error"
  >("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [transferErrorMessage, setTransferErrorMessage] = useState<string>("");

  // Frontend Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [frontendSignerKeyInput, setFrontendSignerKeyInput] = useState<string>("");
  const [showFrontendKeyPrompt, setShowFrontendKeyPrompt] = useState<boolean>(false);

  // Import Private Key Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [importKeyInput, setImportKeyInput] = useState<string>("");
  const [importError, setImportError] = useState<string>("");

  // Show/Hide Private Key State for Selected Account with Confirmation
  const [showSelectedAccountKey, setShowSelectedAccountKey] = useState<boolean>(false);
  const [isKeyConfirmModalOpen, setIsKeyConfirmModalOpen] = useState<boolean>(false);
  const [hasCopiedSelectedKey, setHasCopiedSelectedKey] = useState<boolean>(false);
  const [hasCopiedSelectedKeyRaw, setHasCopiedSelectedKeyRaw] = useState<boolean>(false);
  const [showTransferConfirmKey, setShowTransferConfirmKey] = useState<boolean>(false);

  // Keep refs to avoid stale closures in event listeners
  const accountRef = useRef(account);
  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  const walletTypeRef = useRef(walletType);
  useEffect(() => {
    walletTypeRef.current = walletType;
  }, [walletType]);

  // Derived state
  const isConnected = Boolean(account);
  const isSepolia =
    walletType === "in_app" ||
    chainId.toLowerCase() === SEPOLIA_CONFIG.chainIdHex.toLowerCase();

  const accountIndex = useMemo(() => {
    if (!account || allAccounts.length === 0) return 0;
    const foundIndex = allAccounts.findIndex(
      (acc) => acc.toLowerCase() === account.toLowerCase()
    );
    return foundIndex >= 0 ? foundIndex : 0;
  }, [account, allAccounts]);

  const selectedAccountPrivateKey = useMemo(() => {
    return getPrivateKeyForAddress(account, accountIndex);
  }, [account, accountIndex]);

  const displayName = useMemo(() => {
    if (ensName) return ensName;
    return `Account ${accountIndex + 1}`;
  }, [ensName, accountIndex]);

  // Validation
  const trimmedRecipient = recipient.trim();
  const isValidRecipient = Boolean(
    trimmedRecipient && isAddress(trimmedRecipient)
  );
  const isSelfTransfer = Boolean(
    isValidRecipient &&
      account &&
      trimmedRecipient.toLowerCase() === account.toLowerCase()
  );

  const numericAmount = parseFloat(transferAmount);
  const numericBalance = parseFloat(balance);
  const isValidAmount =
    !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= numericBalance;

  const canTransfer =
    isConnected &&
    isSepolia &&
    isValidRecipient &&
    isValidAmount &&
    !isTransferring;

  // Fetch ETH balance and optional ENS name
  const fetchAccountData = useCallback(
    async (
      targetAddress: string,
      currentWalletType: "metamask" | "in_app" = "in_app"
    ): Promise<void> => {
      if (!targetAddress || !isAddress(targetAddress)) return;

      try {
        if (currentWalletType === "metamask" && window.ethereum) {
          try {
            const browserProvider = new BrowserProvider(window.ethereum);
            const bal = await browserProvider.getBalance(targetAddress);
            setBalance(formatEther(bal));

            try {
              const resolvedEns = await browserProvider.lookupAddress(targetAddress);
              setEnsName(resolvedEns);
            } catch {
              setEnsName(null);
            }
            return;
          } catch (ethErr) {
            console.warn("BrowserProvider getBalance failed, fallback to RPC:", ethErr);
          }
        }

        // In-app or fallback RPC provider
        const rpcProvider = getSepoliaJsonRpcProvider();
        const bal = await rpcProvider.getBalance(targetAddress);
        setBalance(formatEther(bal));
        setEnsName(null);
      } catch (err: unknown) {
        console.error("Failed to fetch balance:", err);
      }
    },
    []
  );

  // Switch network to Sepolia in MetaMask
  const handleSwitchToSepolia = useCallback(async (): Promise<void> => {
    if (!window.ethereum) return;
    try {
      setIsSwitchingChain(true);
      setErrorMessage("");
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CONFIG.chainIdHex }],
      });
    } catch (switchError: unknown) {
      const err = switchError as EthereumRpcError;
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CONFIG.chainIdHex,
                chainName: SEPOLIA_CONFIG.name,
                nativeCurrency: {
                  name: SEPOLIA_CONFIG.currencyName,
                  symbol: SEPOLIA_CONFIG.currencySymbol,
                  decimals: SEPOLIA_CONFIG.decimals,
                },
                rpcUrls: SEPOLIA_CONFIG.rpcUrls,
                blockExplorerUrls: SEPOLIA_CONFIG.blockExplorerUrls,
              },
            ],
          });
        } catch (addError: unknown) {
          setErrorMessage(parseWalletError(addError, "Could not add Sepolia network."));
        }
      } else {
        setErrorMessage(parseWalletError(switchError, "Could not switch to Sepolia."));
      }
    } finally {
      setIsSwitchingChain(false);
    }
  }, []);

  // Open the import private key modal
  const handleOpenImportModal = useCallback(() => {
    setImportError("");
    setImportKeyInput("");
    setIsModalOpen(true);
  }, []);

  // Connect MetaMask wallet
  const handleConnectMetaMask = useCallback(async (): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_DISCONNECTED);
    }
    setLogoutNotice("");

    if (!window.ethereum) {
      setErrorMessage(
        "MetaMask extension is not detected in your browser. Please install MetaMask from https://metamask.io or test using the 3 Example Accounts demo mode below."
      );
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const requested = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!requested || requested.length === 0) {
        throw new Error("No account was selected in MetaMask.");
      }

      // Discover and list ALL permitted accounts from MetaMask
      const allMetaMaskAccs = await getAllMetaMaskAccounts();
      const combinedAccounts = Array.from(
        new Set([...(requested || []), ...allMetaMaskAccs].map((a) => a.toLowerCase()))
      ).map((lower) => {
        return (
          [...(requested || []), ...allMetaMaskAccs].find(
            (a) => a.toLowerCase() === lower
          ) || lower
        );
      });

      setAllAccounts(combinedAccounts.length > 0 ? combinedAccounts : requested);
      const chosenAccount = requested[0];
      setAccount(chosenAccount);
      setWalletType("metamask");
      setInAppWallet(null);

      // Verify chain
      const currentChain = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;
      const activeChain = currentChain.toLowerCase();
      setChainId(activeChain);

      if (activeChain === SEPOLIA_CONFIG.chainIdHex.toLowerCase()) {
        await fetchAccountData(chosenAccount, "metamask");
      } else {
        await handleSwitchToSepolia();
        await fetchAccountData(chosenAccount, "metamask");
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setErrorMessage(parseWalletError(err, "Could not connect to MetaMask."));
    } finally {
      setIsLoading(false);
    }
  }, [fetchAccountData, handleSwitchToSepolia]);

  // Import raw private key
  const handleImportPrivateKey = (): void => {
    const trimmed = importKeyInput.trim();
    if (!trimmed) {
      setImportError("Please enter a private key.");
      return;
    }

    const formattedKey = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;

    try {
      const provider = getSepoliaJsonRpcProvider();
      const imported = new Wallet(formattedKey, provider);

      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY_DISCONNECTED);
      }

      saveInAppWalletToStorage({
        address: imported.address,
        privateKey: imported.privateKey,
        label: `Imported Wallet ${getStoredInAppWallets().length + 1}`,
        createdAt: Date.now(),
      });

      const updatedStored = getStoredInAppWallets();
      setAllAccounts(updatedStored.map((w) => w.address));

      setWalletType("in_app");
      setInAppWallet(imported);
      setAccount(imported.address);
      setChainId(SEPOLIA_CONFIG.chainIdHex);
      setEnsName(null);
      setIsModalOpen(false);
      setImportKeyInput("");
      setLogoutNotice("");

      fetchAccountData(imported.address, "in_app");
    } catch (err: unknown) {
      console.error("Import private key error:", err);
      setImportError("Invalid private key. Must be a valid 32-byte hexadecimal string.");
    }
  };

  // Reconnect saved in-app wallet from browser storage
  const handleReconnectSavedInApp = (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_DISCONNECTED);
    }
    setLogoutNotice("");

    const storedWallets = getStoredInAppWallets();
    if (storedWallets.length === 0) {
      handleOpenImportModal();
      return;
    }

    const target = storedWallets[0];
    try {
      const provider = getSepoliaJsonRpcProvider();
      const restored = new Wallet(target.privateKey, provider);

      setWalletType("in_app");
      setInAppWallet(restored);
      setAccount(restored.address);
      setAllAccounts(storedWallets.map((w) => w.address));
      setChainId(SEPOLIA_CONFIG.chainIdHex);
      fetchAccountData(restored.address, "in_app");
    } catch (err) {
      console.error("Reconnect in-app error:", err);
      setErrorMessage("Could not reconnect stored wallet. Try importing again.");
    }
  };

  // Instant Demo: Load 3 Example Demo Accounts
  const handleLoadExampleAccounts = (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_DISCONNECTED);
    }
    setLogoutNotice("");

    const exampleWallets = PRIVATE_KEY.map((acc, index) => ({
      address: acc.address,
      privateKey: acc.privateKey.startsWith("0x") ? acc.privateKey : `0x${acc.privateKey}`,
      label: acc.label || `Demo Account ${index + 1}`,
      createdAt: Date.now(),
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("dapp_in_app_wallets", JSON.stringify(exampleWallets));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ADDR, exampleWallets[0].address);
    }

    const provider = getSepoliaJsonRpcProvider();
    const firstWallet = new Wallet(exampleWallets[0].privateKey, provider);

    setWalletType("in_app");
    setInAppWallet(firstWallet);
    setAccount(firstWallet.address);
    setAllAccounts(exampleWallets.map((w) => w.address));
    setChainId(SEPOLIA_CONFIG.chainIdHex);
    setBalance(PRIVATE_KEY[0].balance || "1.50");
    setEnsName(null);
    setIsModalOpen(false);
  };

  // Switch / Select active account from connected list
  const handleSelectConnectedAccount = (selectedAddr: string): void => {
    if (!selectedAddr) return;
    setAccount(selectedAddr);
    setShowSelectedAccountKey(false);
    setIsKeyConfirmModalOpen(false);

    if (walletType === "in_app") {
      setActiveInAppWalletAddress(selectedAddr);
      const stored = getStoredInAppWallets();
      const matched = stored.find(
        (w) => w.address.toLowerCase() === selectedAddr.toLowerCase()
      );
      if (matched) {
        try {
          const provider = getSepoliaJsonRpcProvider();
          const restored = new Wallet(matched.privateKey, provider);
          setInAppWallet(restored);
        } catch (err) {
          console.warn("Could not load inAppWallet instance:", err);
        }
      }
      fetchAccountData(selectedAddr, "in_app");
    } else {
      fetchAccountData(selectedAddr, "metamask");
    }
  };

  // Switch or Request Account in MetaMask
  const handleSwitchAccount = async (): Promise<void> => {
    if (!window.ethereum) return;
    try {
      setIsSwitchingAccount(true);
      setErrorMessage("");

      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (permError: unknown) {
        console.warn("wallet_requestPermissions request failed:", permError);
      }

      const requested = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      const allMetaMaskAccs = await getAllMetaMaskAccounts();
      const combinedAccounts = Array.from(
        new Set([...(requested || []), ...allMetaMaskAccs].map((a) => a.toLowerCase()))
      ).map((lower) => {
        return (
          [...(requested || []), ...allMetaMaskAccs].find(
            (a) => a.toLowerCase() === lower
          ) || lower
        );
      });

      if (combinedAccounts && combinedAccounts.length > 0) {
        setAllAccounts(combinedAccounts);
        const newPrimary = requested?.[0] || combinedAccounts[0];
        setAccount(newPrimary);
        await fetchAccountData(newPrimary, "metamask");
      }
    } catch (err: unknown) {
      setErrorMessage(parseWalletError(err, "Failed to switch accounts in MetaMask."));
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  // Disconnect & Log Out
  const handleDisconnect = (): void => {
    setAccount("");
    setAllAccounts([]);
    setWalletType(null);
    setInAppWallet(null);
    setEnsName(null);
    setBalance("0");
    setChainId("");
    setActiveTab("transfer");
    setErrorMessage("");
    setShowSelectedAccountKey(false);
    setIsKeyConfirmModalOpen(false);

    if (typeof window !== "undefined") {
      clearInAppWalletsFromStorage();
      localStorage.setItem(STORAGE_KEY_DISCONNECTED, "true");
    }

    setLogoutNotice(
      "You have logged out and cleared your session. To switch or disconnect your MetaMask account, please open your MetaMask extension and select Disconnect."
    );
  };

  // Copy active address to clipboard
  const handleCopyAddress = async (): Promise<void> => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err: unknown) {
      console.warn("Clipboard write failed:", err);
    }
  };

  // Paste recipient address from clipboard
  const handlePasteRecipient = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRecipient(text.trim());
      }
    } catch (err: unknown) {
      console.warn("Clipboard paste error:", err);
    }
  };

  // Handle Transfer Form Submission: Opens Frontend Confirmation Popup
  const handleOpenTransferConfirm = (e: FormEvent): void => {
    e.preventDefault();
    if (!canTransfer) return;
    setTransferErrorMessage("");
    setTransferStatus("idle");
    setTxHash("");
    setIsConfirmModalOpen(true);
  };

  // Execute Ether Transfer via Frontend Confirmation Popup
  const handleExecuteTransfer = async (): Promise<void> => {
    if (!canTransfer) return;

    try {
      setIsTransferring(true);
      setTransferStatus("broadcasting");
      setTransferErrorMessage("");
      setTxHash("");

      let effectiveInAppWallet: Wallet | undefined = undefined;

      if (walletType === "in_app" && inAppWallet) {
        effectiveInAppWallet = inAppWallet;
      } else {
        const stored = getStoredInAppWallets();
        const matched = stored.find(
          (w) => w.address.toLowerCase() === account.toLowerCase()
        );
        if (matched) {
          effectiveInAppWallet = new Wallet(
            matched.privateKey,
            getSepoliaJsonRpcProvider()
          );
        } else if (frontendSignerKeyInput.trim()) {
          const formatted = frontendSignerKeyInput.trim().startsWith("0x")
            ? frontendSignerKeyInput.trim()
            : `0x${frontendSignerKeyInput.trim()}`;
          effectiveInAppWallet = new Wallet(
            formatted,
            getSepoliaJsonRpcProvider()
          );
        }
      }

      const confirmedHash = await sendETH(trimmedRecipient, transferAmount.trim(), {
        inAppWallet: effectiveInAppWallet,
        onTransactionHash: (hash) => {
          setTxHash(hash);
          setTransferStatus("confirming");
        },
      });

      setTxHash(confirmedHash);
      setTransferStatus("success");
      setRecipient("");
      setTransferAmount("");
      setFrontendSignerKeyInput("");
      setShowFrontendKeyPrompt(false);

      if (account) {
        await fetchAccountData(account, walletType || "in_app");
      }
    } catch (err: unknown) {
      console.error("Ether transfer failed:", err);
      setTransferStatus("error");
      setTransferErrorMessage(
        parseWalletError(err, "Transaction failed. Please check inputs and gas fees.")
      );
    } finally {
      setIsTransferring(false);
    }
  };

  // Quick Amount Selector
  const handleSetMaxAmount = (): void => {
    const maxSafe = Math.max(0, numericBalance - 0.002);
    setTransferAmount(maxSafe > 0 ? maxSafe.toFixed(4) : "0");
  };

  // 1. Initial Page Load: Check In-App Wallet Storage first, then MetaMask
  useEffect(() => {
    const initSavedSession = async (): Promise<void> => {
      if (
        typeof window !== "undefined" &&
        localStorage.getItem(STORAGE_KEY_DISCONNECTED) === "true"
      ) {
        return;
      }

      const storedWallets = getStoredInAppWallets();
      const storedActive = localStorage.getItem(STORAGE_KEY_ACTIVE_ADDR);

      if (storedWallets.length > 0) {
        const activeEntry =
          storedWallets.find((w) => w.address.toLowerCase() === storedActive?.toLowerCase()) ||
          storedWallets[0];

        try {
          const provider = getSepoliaJsonRpcProvider();
          const restoredWallet = new Wallet(activeEntry.privateKey, provider);
          setWalletType("in_app");
          setInAppWallet(restoredWallet);
          setAccount(restoredWallet.address);
          setAllAccounts(storedWallets.map((w) => w.address));
          setChainId(SEPOLIA_CONFIG.chainIdHex);
          await fetchAccountData(restoredWallet.address, "in_app");
          return;
        } catch (err) {
          console.error("Failed to restore in-app wallet:", err);
        }
      }

      // Fallback: If no in-app wallet, check MetaMask pre-authorized accounts
      if (window.ethereum) {
        try {
          const accs = await getAllMetaMaskAccounts();
          if (accs && accs.length > 0) {
            setWalletType("metamask");
            setAllAccounts(accs);
            const initialAccount = accs[0];
            setAccount(initialAccount);

            const chain = (await window.ethereum.request({ method: "eth_chainId" })) as string;
            const activeChain = chain.toLowerCase();
            setChainId(activeChain);

            if (activeChain === SEPOLIA_CONFIG.chainIdHex.toLowerCase()) {
              await fetchAccountData(initialAccount, "metamask");
            }
          }
        } catch (err: unknown) {
          console.error("Auto-connect check failed:", err);
        }
      }
    };

    initSavedSession();
  }, [fetchAccountData]);

  // 2. Listen to MetaMask accountsChanged and chainChanged events
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = async (accs: unknown): Promise<void> => {
      if (
        typeof window !== "undefined" &&
        localStorage.getItem(STORAGE_KEY_DISCONNECTED) === "true"
      ) {
        return;
      }
      if (walletTypeRef.current === "in_app") return;

      const rawAccounts = (accs as string[]) || [];
      if (!rawAccounts || rawAccounts.length === 0) {
        setAccount("");
        setAllAccounts([]);
        setEnsName(null);
        setBalance("0");
        return;
      }

      const allMetaMaskAccs = await getAllMetaMaskAccounts();
      const combinedAccounts = Array.from(
        new Set([...rawAccounts, ...allMetaMaskAccs].map((a) => a.toLowerCase()))
      ).map((lower) => {
        return (
          [...rawAccounts, ...allMetaMaskAccs].find(
            (a) => a.toLowerCase() === lower
          ) || lower
        );
      });

      setAllAccounts(combinedAccounts.length > 0 ? combinedAccounts : rawAccounts);
      const activeFromMetaMask = rawAccounts[0];
      setAccount(activeFromMetaMask);

      window.ethereum
        ?.request({ method: "eth_chainId" })
        .then((chain) => {
          const activeChain = (chain as string).toLowerCase();
          setChainId(activeChain);
          if (activeChain === SEPOLIA_CONFIG.chainIdHex.toLowerCase()) {
            fetchAccountData(activeFromMetaMask, "metamask");
          }
        })
        .catch(console.error);
    };

    const onChainChanged = (newChainId: unknown): void => {
      if (walletTypeRef.current === "in_app") return;
      const parsedChain = (newChainId as string).toLowerCase();
      setChainId(parsedChain);
      if (accountRef.current && parsedChain === SEPOLIA_CONFIG.chainIdHex.toLowerCase()) {
        fetchAccountData(accountRef.current, "metamask");
      }
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", onAccountsChanged);
        window.ethereum.removeListener("chainChanged", onChainChanged);
      }
    };
  }, [fetchAccountData]);

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Top Navigation Bar */}
      <Navbar
        isConnected={isConnected}
        walletType={walletType}
        isSepolia={isSepolia}
        balance={balance}
        account={account}
        displayName={displayName}
        activeTab={activeTab}
        isLoading={isLoading}
        hasMetaMask={hasMetaMask}
        onConnectMetaMask={handleConnectMetaMask}
        onToggleTab={setActiveTab}
        onDisconnect={handleDisconnect}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Network Switcher Banner if wrong chain */}
          {isConnected && !isSepolia && walletType === "metamask" && (
            <div className="mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 backdrop-blur-sm flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5 text-xs text-amber-900 font-medium">
                <span className="text-base shrink-0">⚠️</span>
                <span>Wallet connected to another network.</span>
              </div>
              <button
                type="button"
                onClick={handleSwitchToSepolia}
                disabled={isSwitchingChain}
                className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 transition cursor-pointer shrink-0"
              >
                {isSwitchingChain ? "Switching..." : "Switch to Sepolia"}
              </button>
            </div>
          )}

          {/* Logout Notice Banner */}
          {logoutNotice && !isConnected && (
            <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-center justify-between gap-2 shadow-xs">
              <span className="leading-relaxed flex-1">{logoutNotice}</span>
              <button
                type="button"
                onClick={() => setLogoutNotice("")}
                className="text-emerald-700 hover:text-emerald-900 font-bold px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Main Card Container */}
          <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-200/80 transition-all">
            {/* View 1: Not Connected Landing State */}
            {!isConnected && (
              <LandingCard
                isLoading={isLoading}
                hasMetaMask={hasMetaMask}
                hasSavedInAppWallets={hasSavedInAppWallets}
                contractAddress={CONTRACT_ADDRESS}
                onConnectMetaMask={handleConnectMetaMask}
                onReconnectSavedInApp={handleReconnectSavedInApp}
                onLoadExampleAccounts={handleLoadExampleAccounts}
                onOpenImportModal={handleOpenImportModal}
              />
            )}

            {/* View 2: Send Ether Tab */}
            {isConnected && activeTab === "transfer" && (
              <TransferForm
                walletType={walletType}
                balance={balance}
                numericBalance={numericBalance}
                allAccounts={allAccounts}
                account={account}
                onSelectAccount={handleSelectConnectedAccount}
                recipient={recipient}
                setRecipient={setRecipient}
                isValidRecipient={isValidRecipient}
                isSelfTransfer={isSelfTransfer}
                transferAmount={transferAmount}
                setTransferAmount={setTransferAmount}
                isValidAmount={isValidAmount}
                numericAmount={numericAmount}
                canTransfer={canTransfer}
                isTransferring={isTransferring}
                transferStatus={transferStatus}
                txHash={txHash}
                transferErrorMessage={transferErrorMessage}
                contractAddress={CONTRACT_ADDRESS}
                onPasteRecipient={handlePasteRecipient}
                onSetMaxAmount={handleSetMaxAmount}
                onSubmit={handleOpenTransferConfirm}
              />
            )}

            {/* View 3: Wallet & Accounts Tab */}
            {isConnected && activeTab === "account" && (
              <AccountView
                walletType={walletType}
                ensName={ensName}
                displayName={displayName}
                account={account}
                accountIndex={accountIndex}
                selectedAccountPrivateKey={selectedAccountPrivateKey}
                showSelectedAccountKey={showSelectedAccountKey}
                setShowSelectedAccountKey={setShowSelectedAccountKey}
                onOpenKeyConfirmModal={() => setIsKeyConfirmModalOpen(true)}
                balance={balance}
                isLoading={isLoading}
                onRefreshBalance={() => fetchAccountData(account, walletType || "in_app")}
                hasCopied={hasCopied}
                onCopyAddress={handleCopyAddress}
                hasCopiedSelectedKey={hasCopiedSelectedKey}
                setHasCopiedSelectedKey={setHasCopiedSelectedKey}
                hasCopiedSelectedKeyRaw={hasCopiedSelectedKeyRaw}
                setHasCopiedSelectedKeyRaw={setHasCopiedSelectedKeyRaw}
                allAccounts={allAccounts}
                onSelectAccount={handleSelectConnectedAccount}
                isSwitchingAccount={isSwitchingAccount}
                onSwitchAccount={handleSwitchAccount}
                onOpenImportModal={handleOpenImportModal}
                onDisconnect={handleDisconnect}
              />
            )}
          </div>

          {/* Global Alert Notification */}
          {errorMessage && (
            <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 flex items-start gap-2">
              <span className="font-bold shrink-0">⚠️</span>
              <p className="flex-1 leading-relaxed">{errorMessage}</p>
            </div>
          )}
        </div>
      </main>

      {/* Dynamic Modal 1: Frontend Confirm Reveal Private Key Popup Modal */}
      <KeyRevealConfirmModal
        isOpen={isKeyConfirmModalOpen}
        account={account}
        accountIndex={accountIndex}
        onClose={() => setIsKeyConfirmModalOpen(false)}
        onConfirm={() => {
          setShowSelectedAccountKey(true);
          setIsKeyConfirmModalOpen(false);
        }}
      />

      {/* Dynamic Modal 2: Frontend Transfer Confirmation Popup Modal */}
      <TransferConfirmModal
        isOpen={isConfirmModalOpen}
        isTransferring={isTransferring}
        transferStatus={transferStatus}
        txHash={txHash}
        transferAmount={transferAmount}
        displayName={displayName}
        account={account}
        trimmedRecipient={trimmedRecipient}
        contractAddress={CONTRACT_ADDRESS}
        selectedAccountPrivateKey={selectedAccountPrivateKey}
        showTransferConfirmKey={showTransferConfirmKey}
        setShowTransferConfirmKey={setShowTransferConfirmKey}
        walletType={walletType}
        frontendSignerKeyInput={frontendSignerKeyInput}
        setFrontendSignerKeyInput={setFrontendSignerKeyInput}
        showFrontendKeyPrompt={showFrontendKeyPrompt}
        setShowFrontendKeyPrompt={setShowFrontendKeyPrompt}
        transferErrorMessage={transferErrorMessage}
        onClose={() => {
          setIsConfirmModalOpen(false);
          if (transferStatus === "success") {
            setTransferStatus("idle");
            setTxHash("");
          }
        }}
        onExecuteTransfer={handleExecuteTransfer}
      />

      {/* Dynamic Modal 3: Import Private Key Modal */}
      <WalletModal
        isOpen={isModalOpen}
        importKeyInput={importKeyInput}
        setImportKeyInput={setImportKeyInput}
        importError={importError}
        setImportError={setImportError}
        onClose={() => setIsModalOpen(false)}
        onImportPrivateKey={handleImportPrivateKey}
        onLoadExampleAccounts={handleLoadExampleAccounts}
      />

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        Wallet Transfer DApp • Sepolia Testnet
      </footer>
    </div>
  );
}
