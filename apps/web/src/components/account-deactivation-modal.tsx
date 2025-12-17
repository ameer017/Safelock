"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { SAFELOCK_CONTRACT } from "../lib/contracts";
import { tokenAmountToUsd } from "../lib/app-utils";
import {
  AlertTriangle,
  Loader2,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface AccountDeactivationModalProps {
  children: React.ReactNode;
}

export function AccountDeactivationModal({ children }: AccountDeactivationModalProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [step, setStep] = useState<"warning" | "confirmation" | "processing">("warning");

  const { writeContract, isSuccess, error } = useWriteContract();

  // Get user's active savings information
  const { data: userLocks, isLoading: isLoadingLocks } = useReadContract({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: "getUserLocksWithDetails",
    args: address ? [address] : undefined,
  });

  const handleStartDeactivation = () => {
    setStep("confirmation");
  };

  const handleConfirmDeactivation = async () => {
    if (confirmationText !== "DEACTIVATE") {
      toast({
        title: "Invalid Confirmation",
        description: 'Please type "DEACTIVATE" exactly as shown.',
        variant: "destructive",
      });
      return;
    }

    setStep("processing");

    try {
      writeContract({
        address: SAFELOCK_CONTRACT.address,
        abi: SAFELOCK_CONTRACT.abi,
        functionName: "deactivateAccount",
      });
    } catch (error) {
      console.error("Error deactivating account:", error);
      setStep("confirmation");
      toast({
        title: "Deactivation Failed",
        description: "Failed to deactivate account. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle successful deactivation
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated and all funds have been refunded.",
      });
      setOpen(false);
      setStep("warning");
      setConfirmationText("");
      // Optionally redirect to home page
      window.location.href = "/";
    }
  }, [isSuccess, toast]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setStep("confirmation");
      toast({
        title: "Deactivation Failed",
        description: error.message || "Failed to deactivate account. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const resetModal = () => {
    setStep("warning");
    setConfirmationText("");
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setOpen(true);
    } else {
      resetModal();
    }
  };

  const locks = userLocks?.[1] || [];
  const activeLocks = locks.filter(
    (lock: any) => lock.isActive && !lock.isWithdrawn
  );
  const totalActiveUsd = activeLocks.reduce(
    (sum: number, lock: any) =>
      sum + tokenAmountToUsd(lock.amount, lock.token),
    0
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Emergency Account Deactivation
          </DialogTitle>
          <DialogDescription>
            This action will permanently deactivate your account and refund all funds.
          </DialogDescription>
        </DialogHeader>

        {step === "warning" && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This action cannot be undone. Your account will be permanently deactivated.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg">What happens when you deactivate:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>All your savings locks will be immediately unlocked</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Full refund of all locked amounts (no penalties)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your profile and username will be deleted</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You can register again later if needed</span>
                </li>
              </ul>
            </div>

            {isLoadingLocks ? (
              <div className="p-4 border rounded-lg">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">Current Account Status:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Active Locks:</span>
                    <span className="font-medium">{activeLocks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Locked Amount (USD):</span>
                    <span className="font-medium">
                      $
                      {totalActiveUsd.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetModal}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleStartDeactivation}>
                Continue to Deactivation
              </Button>
            </div>
          </div>
        )}

        {step === "confirmation" && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Final Confirmation Required</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                To confirm account deactivation, please type <code className="bg-muted px-1 rounded">DEACTIVATE</code> in the box below:
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="confirmation">Confirmation</Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type DEACTIVATE to confirm"
                  className="font-mono"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error.message || "Failed to deactivate account"}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("warning")}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDeactivation}
                disabled={confirmationText !== "DEACTIVATE"}
              >
                Deactivate Account
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="space-y-4 text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-red-600" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Deactivating Account...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we process your account deactivation and refund your funds.
                Do not close this window.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
