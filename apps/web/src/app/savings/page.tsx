"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Skeleton } from "../../components/ui/skeleton";
import { CreateLockModal } from "../../components/create-lock-modal";
import { WithdrawModal } from "../../components/withdraw-modal";
import {
  SAFELOCK_CONTRACT,
  CUSD_TOKEN,
  USDT_TOKEN,
  CGHS_TOKEN,
  CNGN_TOKEN,
  CKES_TOKEN,
} from "../../lib/contracts";
import { tokenAmountToUsd } from "../../lib/app-utils";
import {
  TrendingUp,
  DollarSign,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const TOKEN_MAP: Record<string, { symbol: string; name: string }> = {
  [CUSD_TOKEN.address.toLowerCase()]: { symbol: "cUSD", name: "Celo Dollar" },
  [USDT_TOKEN.address.toLowerCase()]: { symbol: "USDT", name: "Tether USD" },
  [CGHS_TOKEN.address.toLowerCase()]: { symbol: "cGHS", name: "Ghana Cedi" },
  [CNGN_TOKEN.address.toLowerCase()]: {
    symbol: "cNGN",
    name: "Nigerian Naira",
  },
  [CKES_TOKEN.address.toLowerCase()]: {
    symbol: "cKES",
    name: "Kenyan Shilling",
  },
};

const getTokenInfo = (tokenAddress: string) => {
  const tokenInfo = TOKEN_MAP[tokenAddress.toLowerCase()];
  return tokenInfo || { symbol: "Unknown", name: "Unknown Token" };
};

function SavingsPageContent() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedLock, setSelectedLock] = useState<{
    id: number;
    amount: bigint;
    unlockTime: bigint;
  } | null>(null);

  const { data: isRegistered, isLoading: isCheckingRegistration } =
    useReadContract({
      address: SAFELOCK_CONTRACT.address,
      abi: SAFELOCK_CONTRACT.abi,
      functionName: "isUserRegistered",
      args: address ? [address] : undefined,
    });

  const { data: userLocks, isLoading: isLoadingLocks } = useReadContract({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: "getUserLocksWithDetails",
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (isConnected && !isCheckingRegistration && isRegistered === false) {
      router.push("/");
    }
  }, [isConnected, isCheckingRegistration, isRegistered, router]);

  if (!isConnected) {
    return (
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-7xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access your savings
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  if (isCheckingRegistration) {
    return (
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading your savings...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const locks = userLocks?.[1] || [];

  // Calculate total active savings in USD (per-token conversion)
  const totalActiveSavingsUsd = locks.reduce(
    (total: number, lock: any) =>
      lock.isActive ? total + tokenAmountToUsd(lock.amount, lock.token) : total,
    0
  );

  const activeLocksCount = locks.filter(
    (lock: any) => lock.isActive && !lock.isWithdrawn
  ).length;
  const completedLocksCount = locks.filter(
    (lock: any) => !lock.isActive && lock.isWithdrawn
  ).length;

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1e18).toFixed(2);
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const getTimeRemaining = (unlockTime: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(unlockTime) - now;

    if (remaining <= 0) return "Unlocked";

    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  };

  const getProgressPercentage = (lockTime: bigint, unlockTime: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const totalDuration = Number(unlockTime) - Number(lockTime);
    const elapsed = now - Number(lockTime);

    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;

    return Math.min((elapsed / totalDuration) * 100, 100);
  };

  const isLockReadyForWithdrawal = (unlockTime: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    return Number(unlockTime) <= now;
  };

  const handleWithdrawClick = (lock: any) => {
    setSelectedLock({
      id: Number(lock.id),
      amount: lock.amount,
      unlockTime: lock.unlockTime,
    });
    setWithdrawModalOpen(true);
  };

  return (
    <main className="flex-1 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold">My Savings</h1>
            <p className="text-muted-foreground">
              Manage and track all your savings locks
            </p>
          </div>
          <CreateLockModal>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Lock
            </Button>
          </CreateLockModal>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Active Savings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold">
                $
                {totalActiveSavingsUsd.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeLocksCount} active lock
                {activeLocksCount !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Locks
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLocksCount}</div>
              <p className="text-xs text-muted-foreground">Currently locked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Locks
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedLocksCount}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Savings Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Overview</CardTitle>
            <CardDescription>
              Track your active savings locks and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLocks ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : locks.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Savings Locks Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start your savings journey by creating your first lock.
                </p>
                <CreateLockModal>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Lock
                  </Button>
                </CreateLockModal>
              </div>
            ) : (
              <div className="space-y-6">
                {locks.map((lock: any) => {
                  const isReady = isLockReadyForWithdrawal(lock.unlockTime);
                  const isWithdrawn = lock.isWithdrawn;

                  return (
                    <div
                      key={lock.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">
                              {lock.title || `Lock #${lock.id}`}
                            </h4>
                            <Badge
                              variant={lock.isActive ? "default" : "secondary"}
                            >
                              {lock.isActive
                                ? "Active"
                                : lock.isWithdrawn
                                ? "Completed"
                                : "Inactive"}
                            </Badge>
                            <Badge variant="outline">
                              {getTokenInfo(lock.token).symbol}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              Amount: {formatAmount(lock.amount)}{" "}
                              {getTokenInfo(lock.token).symbol}
                            </p>
                            <p>Token: {getTokenInfo(lock.token).name}</p>
                            <p>Created: {formatDate(lock.lockTime)}</p>
                            <p>Unlocks: {formatDate(lock.unlockTime)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {!isWithdrawn ? (
                          <>
                            <div className="text-right space-y-2">
                              <div className="text-sm font-medium">
                                {getTimeRemaining(lock.unlockTime)}
                              </div>
                              <Progress
                                value={getProgressPercentage(
                                  lock.lockTime,
                                  lock.unlockTime
                                )}
                                className="w-32"
                              />
                              <div className="text-xs text-muted-foreground">
                                {getProgressPercentage(
                                  lock.lockTime,
                                  lock.unlockTime
                                ).toFixed(1)}
                                % complete
                              </div>
                            </div>

                            {/* Withdraw Button */}
                            {lock.isActive && (
                              <div className="flex flex-col items-end space-y-2">
                                <Button
                                  size="sm"
                                  variant={isReady ? "default" : "outline"}
                                  onClick={() => handleWithdrawClick(lock)}
                                  className="min-w-[120px]"
                                >
                                  {isReady ? (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Withdraw
                                    </>
                                  ) : (
                                    <>Early Withdraw</>
                                  )}
                                </Button>
                                {!isReady && (
                                  <div className="text-xs text-muted-foreground text-center">
                                    Available in{" "}
                                    {getTimeRemaining(lock.unlockTime)}
                                  </div>
                                )}
                                {isReady && !lock.isWithdrawn && (
                                  <div className="text-xs text-green-600 text-center">
                                    Ready to withdraw
                                  </div>
                                )}
                                {!isReady && (
                                  <div className="text-xs text-orange-600 text-center">
                                    Early withdrawal penalty applies
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-right space-y-2">
                            <div className="text-sm font-medium text-green-600">
                              Withdrawn
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(lock.unlockTime)}
                            </div>
                            {lock.penaltyAmount > 0 && (
                              <div className="text-xs text-red-600">
                                Penalty: {formatAmount(lock.penaltyAmount)}{" "}
                                {getTokenInfo(lock.token).symbol}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdraw Modal */}
        {selectedLock && (
          <WithdrawModal
            lockId={selectedLock.id}
            amount={selectedLock.amount}
            unlockTime={selectedLock.unlockTime}
            isOpen={withdrawModalOpen}
            onOpenChange={setWithdrawModalOpen}
          >
            <div />
          </WithdrawModal>
        )}
      </div>
    </main>
  );
}

function SavingsContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <SavingsPageContent />;
}

export default function SavingsPage() {
  return <SavingsContent />;
}
