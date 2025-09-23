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
import { CUSD_TOKEN } from "../lib/contracts";
import { getOperationErrorMessage, OPERATIONS } from "../lib/error-utils";
import { Plus, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface CreateLockModalProps {
  children: React.ReactNode;
}

const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMs = end.getTime() - start.getTime();
  return Math.floor(diffInMs / 1000);
}

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export function CreateLockModal({ children }: CreateLockModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [localError, setLocalError] = useState("");
  const [mounted, setMounted] = useState(false);

  const { address, isConnected } = useAccount();
  const { writeContract, isPending, isError, error, data: writeData } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | undefined>();
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approvalCompleted, setApprovalCompleted] = useState(false);
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const { isLoading: isApproving, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  });

  const [currentAmount, setCurrentAmount] = useState<bigint>(0n);
  const { data: currentAllowance } = useReadContract({
    address: CUSD_TOKEN.address,
    abi: CUSD_TOKEN.abi,
    functionName: "allowance",
    args: address && currentAmount > 0n ? [address, "0x8a300e0FBA80d83C3935EEC65233Cdf4D970972d"] : undefined,
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
    if (writeData && typeof writeData === 'string') {
      if (needsApproval && !approvalTxHash) {
        setApprovalTxHash(writeData as `0x${string}`);
      } else if (!needsApproval || approvalCompleted) {
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
        const contractData = createSavingsLock(durationInSeconds, amountInWei);
        writeContract(contractData);
      } catch (error) {
        console.error("❌ Failed to create lock after approval:", error);
        setLocalError(`Failed to create lock: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }, [isApprovalSuccess, needsApproval, approvalCompleted, startDate, endDate, amount, writeContract]);


  useEffect(() => {
    if (isSuccess && txHash) {
      setIsOpen(false);

      setAmount("");
      setStartDate(formatDateForInput(new Date()));
      setEndDate("");
      setTxHash(undefined);
      setApprovalTxHash(undefined);
      setNeedsApproval(false);
      setApprovalCompleted(false);
      
      window.location.reload();
    }
  }, [isSuccess, txHash]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (isPending || isConfirming || isApproving) {
      return;
    }

    setIsOpen(open);
    
    if (!open) {
      setAmount("");
      setStartDate(formatDateForInput(new Date()));
      setEndDate("");
      setLocalError("");
      setNeedsApproval(false);
      setApprovalCompleted(false);
      setApprovalTxHash(undefined);
      setTxHash(undefined);
    }
  }, [isPending, isConfirming, isApproving]);

  useEffect(() => {
    if ((txHash || writeData) && !isSuccess && !isPending && !isConfirming && !isApproving) {
      const timer = setTimeout(() => {
       
        handleOpenChange(false);

        window.location.reload();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [txHash, writeData, isSuccess, isPending, isConfirming, isApproving, handleOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!amount || !startDate || !endDate) {
      setLocalError("Please fill in all fields");
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

    const amountInWei = BigInt(parseFloat(amount) * 1e18);

    try {
      const allowance = currentAllowance as bigint || 0n;
      
      if (allowance < amountInWei) {
        setNeedsApproval(true);
        setApprovalCompleted(false);
        
        const approvalData = {
          address: CUSD_TOKEN.address,
          abi: CUSD_TOKEN.abi,
          functionName: "approve" as const,
          args: ["0x8a300e0FBA80d83C3935EEC65233Cdf4D970972d" as `0x${string}`, amountInWei] as const,
        };
        
        writeContract(approvalData as any);
        return;
      }
      
      setNeedsApproval(false);
      const contractData = createSavingsLock(durationInSeconds, amountInWei);
      writeContract(contractData);
      
    } catch (error) {
      console.error("❌ Failed to create lock:", error);
      setLocalError(`Failed to create lock: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };


  const isProcessing = isPending || isConfirming || isApproving;

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Savings Lock</DialogTitle>
          <DialogDescription>
            Lock your cUSD tokens for a specified duration to earn rewards and
            build discipline. You&apos;ll need to approve the contract to spend your tokens first.
          </DialogDescription>
        </DialogHeader>

        {amount && currentAmount > 0n && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {currentAllowance && (currentAllowance as bigint) >= currentAmount
                ? "✅ Contract has sufficient allowance to create this lock"
                : "⚠️ You'll need to approve the contract to spend your cUSD tokens first"}
            </AlertDescription>
          </Alert>
        )}


        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (cUSD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter amount to lock"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">
              Minimum: 0.01 cUSD, Maximum: 1,000,000 cUSD
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isProcessing}
                min={formatDateForInput(new Date())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isProcessing}
                min={startDate || formatDateForInput(new Date())}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum: 1 day, Maximum: 1 year. Start date cannot be in the past.
          </p>
          {startDate && endDate && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Lock Duration:{" "}
                {Math.ceil(
                  calculateDuration(startDate, endDate) / (24 * 60 * 60)
                )}{" "}
                days
              </p>
              <p className="text-xs text-muted-foreground">
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
              {localError || getOperationErrorMessage(OPERATIONS.CREATE_LOCK, error)}
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

        {!isPending && !isConfirming && !isApproving && !isSuccess && (txHash || writeData) && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Transaction submitted! If your transaction was successful on the blockchain but this modal is still open, you can safely close it.
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isApproving ? "Approving..." : isPending ? "Creating..." : "Confirming..."}
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
