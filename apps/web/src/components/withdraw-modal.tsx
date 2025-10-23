"use client";

import { useState, useEffect, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { withdrawSavings } from "../lib/safelock-contract";
import { getOperationErrorMessage, OPERATIONS } from "../lib/error-utils";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

interface WithdrawModalProps {
  children: React.ReactNode;
  lockId: number;
  amount: bigint;
  unlockTime: bigint;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PenaltyCalculation {
  isEarlyWithdrawal: boolean;
  penaltyAmount: bigint;
  withdrawalAmount: bigint;
  timeRemaining: number;
  penaltyPercentage: number;
}

export function WithdrawModal({
  children,
  lockId,
  amount,
  unlockTime,
  isOpen,
  onOpenChange,
}: WithdrawModalProps) {
  const [localError, setLocalError] = useState<string>("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [withdrawalReason, setWithdrawalReason] = useState<string>("");

  const {
    writeContract,
    data: writeData,
    error,
    isPending,
  } = useWriteContract();

  const { isLoading: isConfirmingTx, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const isLockReady = () => {
    const now = Math.floor(Date.now() / 1000);
    return Number(unlockTime) <= now;
  };

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1e18).toFixed(2);
  };

  const formatUnlockTime = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  // Dynamic penalty calculation based on time remaining
  const calculatePenalty = (): PenaltyCalculation => {
    const now = Math.floor(Date.now() / 1000);
    const unlockTimestamp = Number(unlockTime);
    const timeRemaining = unlockTimestamp - now;
    const isEarlyWithdrawal = timeRemaining > 0;

    if (!isEarlyWithdrawal) {
      return {
        isEarlyWithdrawal: false,
        penaltyAmount: 0n,
        withdrawalAmount: amount,
        timeRemaining: 0,
        penaltyPercentage: 0,
      };
    }

    const penaltyRate = 0.001;

    const penaltyAmount = BigInt(Math.floor(Number(amount) * penaltyRate));
    const withdrawalAmount = amount - penaltyAmount;

    return {
      isEarlyWithdrawal: true,
      penaltyAmount,
      withdrawalAmount,
      timeRemaining,
      penaltyPercentage: penaltyRate * 100,
    };
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "0 seconds";

    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

    return parts.join(", ");
  };

  useEffect(() => {
    if (writeData) {
      setTxHash(writeData);
      setLocalError("");
    }
  }, [writeData]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (isPending || isConfirmingTx) {
        return;
      }

      onOpenChange(open);
      if (!open) {
        setTxHash(undefined);
        setLocalError("");
      }
    },
    [isPending, isConfirmingTx, onOpenChange]
  );

  useEffect(() => {
    if (isTxSuccess && txHash) {
      setTimeout(() => {
        handleOpenChange(false);
        window.location.reload();
      }, 3000);
    }
  }, [isTxSuccess, txHash, handleOpenChange]);

  const handleWithdraw = () => {
    const penaltyInfo = calculatePenalty();

    // For early withdrawals, require a reason
    if (penaltyInfo.isEarlyWithdrawal && !withdrawalReason.trim()) {
      setLocalError("Please provide a reason for early withdrawal");
      return;
    }

    setLocalError("");
    const contractData = withdrawSavings(BigInt(lockId));
    writeContract(contractData);
  };

  const isProcessing = isPending || isConfirmingTx;
  const penaltyInfo = calculatePenalty();

  return (
    <>
      {children}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {penaltyInfo.isEarlyWithdrawal
                ? "Early Withdrawal"
                : "Withdraw Savings"}
            </DialogTitle>
            <DialogDescription>
              {penaltyInfo.isEarlyWithdrawal
                ? `Withdraw your savings from Lock #${lockId} before the lock period ends`
                : `Confirm withdrawal of your savings from Lock #${lockId}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Lock Information */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Lock ID:</span>
                <span className="font-medium">#{lockId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Original Amount:
                </span>
                <span className="font-medium">${formatAmount(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Unlock Time:
                </span>
                <span className="font-medium">
                  {formatUnlockTime(unlockTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span
                  className={`font-medium ${
                    isLockReady() ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {isLockReady() ? "Ready to Withdraw" : "Still Locked"}
                </span>
              </div>
              {penaltyInfo.isEarlyWithdrawal && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Time Remaining:
                  </span>
                  <span className="font-medium text-orange-600">
                    {formatTimeRemaining(penaltyInfo.timeRemaining)}
                  </span>
                </div>
              )}
            </div>

            {/* Penalty Information */}
            {penaltyInfo.isEarlyWithdrawal && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-800">
                    Early Withdrawal Penalty
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-orange-700">
                      Penalty Rate:
                    </span>
                    <span className="font-medium text-orange-800">
                      {penaltyInfo.penaltyPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-orange-700">
                      Penalty Amount:
                    </span>
                    <span className="font-medium text-orange-800">
                      -${formatAmount(penaltyInfo.penaltyAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-orange-200 pt-2">
                    <span className="text-sm font-semibold text-orange-800">
                      You&apos;ll Receive:
                    </span>
                    <span className="font-bold text-orange-900">
                      ${formatAmount(penaltyInfo.withdrawalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Withdrawal Reason for Early Withdrawals */}
            {penaltyInfo.isEarlyWithdrawal && (
              <div className="space-y-2">
                <Label
                  htmlFor="withdrawal-reason"
                  className="text-sm font-medium"
                >
                  Reason for Early Withdrawal *
                </Label>
                <Input
                  id="withdrawal-reason"
                  placeholder="Please explain why you need to withdraw early..."
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  This information will be recorded in your transaction history.
                </p>
              </div>
            )}

            {!isLockReady() && !penaltyInfo.isEarlyWithdrawal && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  This lock is still active and cannot be withdrawn yet. You can
                  only withdraw after the unlock time has passed.
                </AlertDescription>
              </Alert>
            )}

            {penaltyInfo.isEarlyWithdrawal && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You are withdrawing early. A penalty of{" "}
                  {penaltyInfo.penaltyPercentage.toFixed(1)}% (
                  {formatAmount(penaltyInfo.penaltyAmount)}) will be deducted
                  from your withdrawal.
                </AlertDescription>
              </Alert>
            )}

            {(localError || error) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="break-words">
                  {localError ||
                    getOperationErrorMessage(OPERATIONS.WITHDRAW, error)}
                </AlertDescription>
              </Alert>
            )}

            {isTxSuccess && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Withdrawal successful! Your funds have been transferred to
                  your wallet. This modal will close automatically.
                </AlertDescription>
              </Alert>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    {isPending && "Confirming transaction..."}
                    {isConfirmingTx && "Processing withdrawal..."}
                  </span>
                </div>
                {txHash && (
                  <div className="text-xs text-muted-foreground">
                    Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={isProcessing}
              className="w-full sm:w-auto"
              variant={
                penaltyInfo.isEarlyWithdrawal ? "destructive" : "default"
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPending && "Confirming..."}
                  {isConfirmingTx && "Processing..."}
                </>
              ) : penaltyInfo.isEarlyWithdrawal ? (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Early Withdraw ${formatAmount(penaltyInfo.withdrawalAmount)}
                </>
              ) : (
                `Withdraw $${formatAmount(amount)}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
