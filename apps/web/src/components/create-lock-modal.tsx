"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { createSavingsLock } from "../lib/safelock-contract";
import {
  CUSD_TOKEN,
  USDT_TOKEN,
  CGHS_TOKEN,
  CNGN_TOKEN,
  CKES_TOKEN,
  SAFELOCK_CONTRACT,
} from "../lib/contracts";
import { getOperationErrorMessage, OPERATIONS } from "../lib/error-utils";
import { Plus, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CreateLockModalProps {
  children: React.ReactNode;
}

const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMs = end.getTime() - start.getTime();
  return Math.floor(diffInMs / 1000);
};

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const SUPPORTED_TOKENS = [
  { ...CUSD_TOKEN, label: "cUSD - Celo Dollar" },
  { ...USDT_TOKEN, label: "USDT - Tether USD" },
  { ...CGHS_TOKEN, label: "cGHS - Ghana Cedi" },
  { ...CNGN_TOKEN, label: "cNGN - Nigerian Naira" },
  { ...CKES_TOKEN, label: "cKES - Kenyan Shilling" },
];

const getTokenInfo = (tokenAddress: string) => {
  const token = SUPPORTED_TOKENS.find(
    (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
  );
  return token
    ? { symbol: token.symbol, name: token.name }
    : { symbol: "Unknown", name: "Unknown Token" };
};

export function CreateLockModal({ children }: CreateLockModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [selectedToken, setSelectedToken] = useState(CUSD_TOKEN.address);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [localError, setLocalError] = useState("");
  const [mounted, setMounted] = useState(false);

  const { address, isConnected } = useAccount();
  const {
    writeContract,
    isPending,
    isError,
    error,
    data: writeData,
  } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [approvalTxHash, setApprovalTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approvalCompleted, setApprovalCompleted] = useState(false);

  // Check if user is registered
  const { data: isUserRegistered } = useReadContract({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: "isUserRegistered",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const { isLoading: isApproving, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approvalTxHash,
    });

  const [currentAmount, setCurrentAmount] = useState<bigint>(0n);
  const { data: currentAllowance } = useReadContract({
    address: selectedToken,
    abi: CUSD_TOKEN.abi, // All tokens use the same ERC20 ABI
    functionName: "allowance",
    args:
      address && currentAmount > 0n
        ? [address, SAFELOCK_CONTRACT.address]
        : undefined,
    query: {
      enabled: !!address && currentAmount > 0n,
    },
  });

  useEffect(() => {
    setMounted(true);
    setStartDate(formatDateForInput(new Date()));
  }, []);

  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) >= 0) {
      setCurrentAmount(BigInt(parseFloat(amount) * 1e18));
    } else {
      setCurrentAmount(0n);
    }
  }, [amount]);

  useEffect(() => {
    if (writeData && typeof writeData === "string") {
      if (needsApproval && !approvalTxHash) {
        setApprovalTxHash(writeData as `0x${string}`);
        return;
      }

      if (!needsApproval || approvalCompleted) {
        console.log("🔒 Setting lock creation transaction hash");
        setTxHash(writeData as `0x${string}`);
      }
    }
  }, [writeData, needsApproval, approvalTxHash, approvalCompleted]);

  useEffect(() => {
    if (isApprovalSuccess && needsApproval && !approvalCompleted) {
      setApprovalCompleted(true);
      setLocalError("");

      const durationInSeconds = calculateDuration(startDate, endDate);
      const amountInWei = BigInt(parseFloat(amount) * 1e18);

      try {
        const contractData = createSavingsLock(
          durationInSeconds,
          amountInWei,
          title,
          selectedToken
        );
        writeContract(contractData);
      } catch (error) {
        console.error("❌ Failed to create lock after approval:", error);
        setLocalError(
          `Failed to create lock: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  }, [
    isApprovalSuccess,
    needsApproval,
    approvalCompleted,
    title,
    selectedToken,
    startDate,
    endDate,
    amount,
    writeContract,
  ]);

  useEffect(() => {
    if (isSuccess && txHash) {
      setIsOpen(false);

      setAmount("");
      setTitle("");
      setSelectedToken(CUSD_TOKEN.address);
      setStartDate(formatDateForInput(new Date()));
      setEndDate("");
      setTxHash(undefined);
      setApprovalTxHash(undefined);
      setNeedsApproval(false);
      setApprovalCompleted(false);

      window.location.reload();
    }
  }, [isSuccess, txHash]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (isPending || isConfirming || isApproving) {
        return;
      }

      setIsOpen(open);

      if (!open) {
        setAmount("");
        setTitle("");
        setSelectedToken(CUSD_TOKEN.address);
        setStartDate(formatDateForInput(new Date()));
        setEndDate("");
        setLocalError("");
        setNeedsApproval(false);
        setApprovalCompleted(false);
        setApprovalTxHash(undefined);
        setTxHash(undefined);
      }
    },
    [isPending, isConfirming, isApproving]
  );

  useEffect(() => {
    if (
      (txHash || writeData) &&
      !isSuccess &&
      !isPending &&
      !isConfirming &&
      !isApproving
    ) {
      const timer = setTimeout(() => {
        handleOpenChange(false);

        window.location.reload();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [
    txHash,
    writeData,
    isSuccess,
    isPending,
    isConfirming,
    isApproving,
    handleOpenChange,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!amount || !title || !startDate || !endDate) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (title.length === 0) {
      setLocalError("Title cannot be empty");
      return;
    }

    if (title.length > 50) {
      setLocalError("Title must be at most 50 characters");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setLocalError("Start date cannot be in the past");
      return;
    }

    if (end <= start) {
      setLocalError("End date must be after start date");
      return;
    }

    const durationInSeconds = calculateDuration(startDate, endDate);
    const minDuration = 24 * 60 * 60;
    const maxDuration = 365 * 24 * 60 * 60;

    if (durationInSeconds < minDuration) {
      setLocalError("Lock duration must be at least 1 day");
      return;
    }

    if (durationInSeconds > maxDuration) {
      setLocalError("Lock duration cannot exceed 1 year");
      return;
    }

    if (!isConnected || !address) {
      setLocalError("Please connect your wallet first");
      return;
    }

    if (!isUserRegistered) {
      setLocalError(
        "Please register your account first before creating a lock"
      );
      return;
    }

    const amountInWei = BigInt(parseFloat(amount) * 1e18);

    try {
      const allowance = (currentAllowance as bigint) || 0n;

      if (allowance < amountInWei) {
        setNeedsApproval(true);
        setApprovalCompleted(false);

        const approvalData = {
          address: selectedToken,
          abi: CUSD_TOKEN.abi, // All tokens use the same ERC20 ABI
          functionName: "approve" as const,
          args: [SAFELOCK_CONTRACT.address, amountInWei] as const,
        };

        writeContract(approvalData as any);
        return;
      }

      setNeedsApproval(false);
      const contractData = createSavingsLock(
        durationInSeconds,
        amountInWei,
        title,
        selectedToken
      );
      writeContract(contractData);
    } catch (error) {
      console.error("❌ Failed to create lock:", error);
      setLocalError(
        `Failed to create lock: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const isProcessing = isPending || isConfirming || isApproving;

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Savings Lock</DialogTitle>
          <DialogDescription>
            Lock your tokens for a specified duration to build discipline.
            Choose from cUSD, USDT, cGHS, cNGN, or cKES. You&apos;ll need to
            approve the contract to spend your tokens first.
          </DialogDescription>
        </DialogHeader>

        {address && (
          <Alert variant={isUserRegistered ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isUserRegistered
                ? "✅ Account is registered and ready to create locks"
                : "❌ Please register your account first before creating a lock"}
            </AlertDescription>
          </Alert>
        )}

        {amount && currentAmount > 0n && isUserRegistered && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {currentAllowance && (currentAllowance as bigint) >= currentAmount
                ? "✅ Contract has sufficient allowance to create this lock"
                : `⚠️ You'll need to approve the contract to spend your ${
                    getTokenInfo(selectedToken).symbol
                  } tokens first`}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Row */}
          <div className="space-y-3">
            <Label htmlFor="title" className="text-base font-medium">
              Lock Title
            </Label>
            <Input
              id="title"
              type="text"
              maxLength={50}
              placeholder="e.g., Emergency Fund, Vacation Savings"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isProcessing}
              className="h-12 text-base"
            />
            <p className="text-sm text-muted-foreground">
              Give your lock a meaningful name (1-50 characters)
            </p>
          </div>

          {/* Token and Amount Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="token" className="text-base font-medium">
                Token
              </Label>
              <Select
                value={selectedToken}
                onValueChange={(value) =>
                  setSelectedToken(value as `0x${string}`)
                }
                disabled={isProcessing}
              >
                <SelectTrigger id="token" className="h-12 text-base">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_TOKENS.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose which token to lock
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="amount" className="text-base font-medium">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter amount to lock"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
                className="h-12 text-base"
              />
              <p className="text-sm text-muted-foreground">
                Minimum: 0.01, Maximum: 1,000,000 tokens
              </p>
            </div>
          </div>

          {/* Date Range Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="startDate" className="text-base font-medium">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isProcessing}
                min={formatDateForInput(new Date())}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="endDate" className="text-base font-medium">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isProcessing}
                min={startDate || formatDateForInput(new Date())}
                className="h-12 text-base"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Minimum: 1 day, Maximum: 1 year. Start date cannot be in the past.
          </p>
          {startDate && endDate && (
            <div className="p-4 bg-muted rounded-lg border">
              <p className="text-base font-semibold">
                Lock Duration:{" "}
                {Math.ceil(
                  calculateDuration(startDate, endDate) / (24 * 60 * 60)
                )}{" "}
                days
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                From {new Date(startDate).toLocaleDateString()} to{" "}
                {new Date(endDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Approval Status Messages */}
          {needsApproval && isApproving && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Waiting for approval transaction to be confirmed...
              </AlertDescription>
            </Alert>
          )}

          {needsApproval && isApprovalSuccess && !approvalCompleted && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Approval successful! Now creating your savings lock...
              </AlertDescription>
            </Alert>
          )}

          {(localError || isError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="break-words">
                {localError ||
                  getOperationErrorMessage(OPERATIONS.CREATE_LOCK, error)}
              </AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                🎉 Lock created successfully! Your funds are now locked.
              </AlertDescription>
            </Alert>
          )}

          {!isPending &&
            !isConfirming &&
            !isApproving &&
            !isSuccess &&
            (txHash || writeData) && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Transaction submitted! If your transaction was successful on
                  the blockchain but this modal is still open, you can safely
                  close it.
                  <div className="mt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        handleOpenChange(false);

                        window.location.reload();
                      }}
                      className="w-full"
                    >
                      Close Modal & Refresh
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isProcessing}
              className="h-12 px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing || !isUserRegistered}
              className="h-12 px-8"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isApproving
                    ? "Approving..."
                    : isPending
                    ? "Creating..."
                    : "Confirming..."}
                </>
              ) : needsApproval && !isApprovalSuccess ? (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Approve & Create Lock
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Lock
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
