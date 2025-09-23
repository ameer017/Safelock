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
import { withdrawSavings } from "../lib/safelock-contract";
import { getOperationErrorMessage, OPERATIONS } from "../lib/error-utils";
import { CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface WithdrawModalProps {
  children: React.ReactNode;
  lockId: number;
  amount: bigint;
  unlockTime: bigint;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawModal({
  children,
  lockId,
  amount,
  unlockTime,
  isOpen,
  onOpenChange,
}: WithdrawModalProps) {
  const router = useRouter();
  const [localError, setLocalError] = useState<string>("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

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
        router.refresh();
      }, 3000);
    }
  }, [isTxSuccess, txHash, router, handleOpenChange]);

  const handleWithdraw = () => {
    if (!isLockReady()) {
      setLocalError("Lock is not ready for withdrawal yet");
      return;
    }

    setLocalError("");
    const contractData = withdrawSavings(BigInt(lockId));
    writeContract(contractData);
  };

  const isProcessing = isPending || isConfirmingTx;

  return (
    <>
      {children}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Savings</DialogTitle>
            <DialogDescription>
              Confirm withdrawal of your savings from Lock #{lockId}
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
                <span className="text-sm text-muted-foreground">Amount:</span>
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
            </div>

            {!isLockReady() && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  This lock is still active and cannot be withdrawn yet. You can
                  only withdraw after the unlock time has passed.
                </AlertDescription>
              </Alert>
            )}

            {(localError || error) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="break-words">
                  {localError || getOperationErrorMessage(OPERATIONS.WITHDRAW, error)}
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
              disabled={!isLockReady() || isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPending && "Confirming..."}
                  {isConfirmingTx && "Processing..."}
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
