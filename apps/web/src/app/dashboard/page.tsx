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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Skeleton } from "../../components/ui/skeleton";
import { CreateLockModal } from "../../components/create-lock-modal";
import { SAFELOCK_CONTRACT } from "../../lib/contracts";
import {
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Plus,
  Minus,
  History,
  AlertCircle,
  Loader2,
} from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const { data: isRegistered, isLoading: isCheckingRegistration } =
    useReadContract({
      address: SAFELOCK_CONTRACT.address,
      abi: SAFELOCK_CONTRACT.abi,
      functionName: "isUserRegistered",
      args: address ? [address] : undefined,
    });

  const { data: userProfile, isLoading: isLoadingProfile } = useReadContract({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: "getUserProfile",
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
              Please connect your wallet to access the dashboard
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  if (isCheckingRegistration || isLoadingProfile) {
    return (
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isRegistered) {
    return (
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-7xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to register on SafeLock to access the dashboard. Please
              register first.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  console.log({ isRegistered });

  const locks = userLocks?.[1] || [];
  const activeLocks = locks.filter(
    (lock: any) => lock.isActive && !lock.isWithdrawn
  );
  const totalActiveAmount = activeLocks.reduce(
    (sum: number, lock: any) => sum + Number(lock.amount),
    0
  );
  const totalActiveLocks = activeLocks.length;
  const totalWithdrawn = locks
    .filter((lock: any) => lock.isWithdrawn)
    .reduce((sum: number, lock: any) => sum + Number(lock.amount), 0);
  const totalPenalties = locks.reduce(
    (sum: number, lock: any) => sum + Number(lock.penaltyAmount),
    0
  );

  return (
    <main className="flex-1 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Savings Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile?.username || "User"}! Manage your savings
            and track your progress.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Savings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingLocks ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    $
                    {(totalActiveAmount / 1e18).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalActiveLocks} active lock
                    {totalActiveLocks !== 1 ? "s" : ""}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Withdrawn
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingLocks ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    $
                    {(totalWithdrawn / 1e18).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {locks.filter((lock: any) => lock.isWithdrawn).length}{" "}
                    withdrawal
                    {locks.filter((lock: any) => lock.isWithdrawn).length !== 1
                      ? "s"
                      : ""}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingLocks ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{locks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeLocks.length} active,{" "}
                    {locks.length - activeLocks.length} completed
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Penalties Paid
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingLocks ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    $
                    {(totalPenalties / 1e18).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Early withdrawal penalties
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Savings Overview */}
          <div className="lg:col-span-2">
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
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : activeLocks.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Active Savings
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You don&apos;t have any active savings locks yet.
                    </p>
                    {isRegistered && (
                      <CreateLockModal>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Lock
                        </Button>
                      </CreateLockModal>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {activeLocks.map((lock: any) => {
                        const lockDuration =
                          Number(lock.unlockTime) - Number(lock.lockTime);
                        const timeRemaining =
                          Number(lock.unlockTime) -
                          Math.floor(Date.now() / 1000);
                        const progressPercent = Math.max(
                          0,
                          Math.min(
                            100,
                            ((lockDuration - timeRemaining) / lockDuration) *
                              100
                          )
                        );

                        return (
                          <div key={lock.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">
                                  Lock #{lock.id}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Amount: $
                                  {(Number(lock.amount) / 1e18).toLocaleString(
                                    undefined,
                                    { maximumFractionDigits: 2 }
                                  )}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  timeRemaining > 0 ? "default" : "secondary"
                                }
                              >
                                {timeRemaining > 0
                                  ? "Active"
                                  : "Ready to Withdraw"}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{Math.round(progressPercent)}%</span>
                              </div>
                              <Progress
                                value={progressPercent}
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground">
                                {timeRemaining > 0
                                  ? `Unlocks in ${Math.ceil(
                                      timeRemaining / (24 * 60 * 60)
                                    )} days`
                                  : "Ready for withdrawal"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your savings account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <Minus className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Recent Activity
                  </h3>
                  <p className="text-muted-foreground">
                    Your recent activity will appear here once you start using
                    SafeLock.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all your savings locks and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Locks</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                {isLoadingLocks ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : locks.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Transactions Yet
                    </h3>
                    <p className="text-muted-foreground">
                      Your transaction history will appear here once you create
                      your first savings lock.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {locks.map((lock) => {
                      const lockDate = new Date(
                        Number(lock.lockTime) * 1000
                      ).toLocaleDateString();
                      const isActive = lock.isActive && !lock.isWithdrawn;
                      const isCompleted = lock.isWithdrawn;

                      return (
                        <div
                          key={lock.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback
                                className={
                                  isActive
                                    ? "bg-green-100 text-green-600"
                                    : isCompleted
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-600"
                                }
                              >
                                {isActive ? (
                                  <Target className="h-4 w-4" />
                                ) : isCompleted ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <Minus className="h-4 w-4" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">Lock #{lock.id}</p>
                              <p className="text-sm text-muted-foreground">
                                Created: {lockDate}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              $
                              {(Number(lock.amount) / 1e18).toLocaleString(
                                undefined,
                                { maximumFractionDigits: 2 }
                              )}
                            </p>
                            <Badge
                              variant={
                                isActive
                                  ? "default"
                                  : isCompleted
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {isActive
                                ? "Active"
                                : isCompleted
                                ? "Withdrawn"
                                : "Inactive"}
                            </Badge>
                            {lock.penaltyAmount > 0 && (
                              <p className="text-xs text-red-600 mt-1">
                                Penalty: $
                                {(Number(lock.penaltyAmount) / 1e18).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="active" className="mt-6">
                {isLoadingLocks ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : activeLocks.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Active Locks
                    </h3>
                    <p className="text-muted-foreground">
                      You don&apos;t have any active savings locks at the
                      moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeLocks.map((lock) => {
                      const lockDate = new Date(
                        Number(lock.lockTime) * 1000
                      ).toLocaleDateString();
                      const timeRemaining =
                        Number(lock.unlockTime) - Math.floor(Date.now() / 1000);

                      return (
                        <div
                          key={lock.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-green-100 text-green-600">
                                <Target className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">Lock #{lock.id}</p>
                              <p className="text-sm text-muted-foreground">
                                Created: {lockDate}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              $
                              {(Number(lock.amount) / 1e18).toLocaleString(
                                undefined,
                                { maximumFractionDigits: 2 }
                              )}
                            </p>
                            <Badge variant="default" className="text-xs">
                              {timeRemaining > 0
                                ? "Active"
                                : "Ready to Withdraw"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {timeRemaining > 0
                                ? `Unlocks in ${Math.ceil(
                                    timeRemaining / (24 * 60 * 60)
                                  )} days`
                                : "Ready for withdrawal"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="completed" className="mt-6">
                {isLoadingLocks ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : locks.filter((lock) => lock.isWithdrawn).length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Completed Locks
                    </h3>
                    <p className="text-muted-foreground">
                      Your completed withdrawals will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {locks
                      .filter((lock) => lock.isWithdrawn)
                      .map((lock) => {
                        const withdrawDate = new Date(
                          Number(lock.unlockTime) * 1000
                        ).toLocaleDateString();

                        return (
                          <div
                            key={lock.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  <TrendingUp className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">Lock #{lock.id}</p>
                                <p className="text-sm text-muted-foreground">
                                  Withdrawn: {withdrawDate}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                $
                                {(Number(lock.amount) / 1e18).toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 2 }
                                )}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                Withdrawn
                              </Badge>
                              {lock.penaltyAmount > 0 && (
                                <p className="text-xs text-red-600 mt-1">
                                  Penalty: $
                                  {(Number(lock.penaltyAmount) / 1e18).toFixed(
                                    2
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function Dashboard() {
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
              <p>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <DashboardContent />;
}
