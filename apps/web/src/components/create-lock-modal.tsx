"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
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
import { useDivvi } from "../hooks/use-divvi";
import { createSavingsLockWithReferral } from "../lib/safelock-contract";
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
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { address, isConnected } = useAccount();
  const { isAvailable: isDivviAvailable } = useDivvi();


  useEffect(() => {
    setMounted(true);
    // Set default start date to today
    setStartDate(formatDateForInput(new Date()));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!amount || !startDate || !endDate) {
      setError("Please fill in all fields");
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

    if (start < today) {
      setError("Start date cannot be in the past");
      return;
    }

    if (end <= start) {
      setError("End date must be after start date");
      return;
    }

    const durationInSeconds = calculateDuration(startDate, endDate);
    const minDuration = 24 * 60 * 60;
    const maxDuration = 365 * 24 * 60 * 60;

    if (durationInSeconds < minDuration) {
      setError("Lock duration must be at least 1 day");
      return;
    }

    if (durationInSeconds > maxDuration) {
      setError("Lock duration cannot exceed 1 year");
      return;
    }

    const amountInWei = BigInt(parseFloat(amount) * 1e18);

 

    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsPending(true);
    setIsConfirming(false);
    setIsSuccess(false);

    try {
      // Use Divvi-integrated lock creation function
      await createSavingsLockWithReferral(
        address,
        durationInSeconds,
        amountInWei
      );
      
      setIsPending(false);
      setIsConfirming(true);
      
      // Simulate waiting for confirmation
      setTimeout(() => {
        setIsConfirming(false);
        setIsSuccess(true);
        setIsOpen(false);
        // Reset form
        setAmount("");
        setStartDate(formatDateForInput(new Date()));
        setEndDate("");
      }, 3000);
      
    } catch (error) {
      console.error("❌ Failed to create lock:", error);
      setIsPending(false);
      setIsConfirming(false);
      setError(`Failed to create lock: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isPending && !isConfirming) {
      setIsOpen(open);
      if (!open) {
        setAmount("");
        setStartDate(formatDateForInput(new Date()));
        setEndDate("");
        setError("");
      }
    }
  };

  const isProcessing = isPending || isConfirming;

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
            build discipline.
          </DialogDescription>
        </DialogHeader>

        {isDivviAvailable && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Referral tracking enabled - your savings lock will be tracked for rewards!
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

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Lock created successfully! Your funds are now locked.
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
                  {isPending ? "Creating..." : "Confirming..."}
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
