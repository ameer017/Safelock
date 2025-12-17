"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { SAFELOCK_CONTRACT } from "../lib/contracts";
import { getTokenInfo, tokenAmountToUsd } from "../lib/app-utils";
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  History
} from "lucide-react";

interface TransactionHistoryProps {
  className?: string;
}

interface Transaction {
  id: string;
  type: 'withdrawal' | 'early_withdrawal' | 'lock_created';
  amount: bigint;
  penaltyAmount?: bigint;
  timestamp: number;
  lockId: number;
  reason?: string;
  isEarlyWithdrawal: boolean;
  token: string;
}

export function TransactionHistory({ className }: TransactionHistoryProps) {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get user locks data
  const { data: userLocks, isLoading: isLoadingLocks } = useReadContract({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: "getUserLocksWithDetails",
    args: address ? [address] : undefined,
  });

  // Process transactions from lock data
  useEffect(() => {
    if (userLocks && userLocks[1]) {
      const locks = userLocks[1] as any[];
      const processedTransactions: Transaction[] = [];

      locks.forEach((lock) => {
        // Add lock creation transaction
        processedTransactions.push({
          id: `lock-${lock.id}`,
          type: 'lock_created',
          amount: BigInt(lock.amount),
          timestamp: Number(lock.lockTime),
          lockId: Number(lock.id),
          isEarlyWithdrawal: false,
          token: lock.token,
        });

        // Add withdrawal transaction if withdrawn
        if (lock.isWithdrawn) {
          const isEarlyWithdrawal = lock.penaltyAmount > 0;
          processedTransactions.push({
            id: `withdrawal-${lock.id}`,
            type: isEarlyWithdrawal ? 'early_withdrawal' : 'withdrawal',
            amount: BigInt(lock.amount),
            penaltyAmount: BigInt(lock.penaltyAmount || 0),
            timestamp: Number(lock.unlockTime), // Using unlock time as withdrawal time
            lockId: Number(lock.id),
            reason: isEarlyWithdrawal ? "Early withdrawal with penalty" : "Regular withdrawal",
            isEarlyWithdrawal: isEarlyWithdrawal,
            token: lock.token,
          });
        }
      });

      // Sort by timestamp (newest first)
      processedTransactions.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(processedTransactions);
    }
    setIsLoading(false);
  }, [userLocks]);

  const formatTokenAmount = (amount: bigint) => {
    return (Number(amount) / 1e18).toFixed(2);
  };

  const formatUsdAmount = (amount: bigint, token: string) => {
    const usd = tokenAmountToUsd(amount, token);
    return usd.toFixed(2);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'lock_created':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'early_withdrawal':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'lock_created':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-blue-600';
      case 'early_withdrawal':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading || isLoadingLocks) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Transaction History</span>
          </CardTitle>
          <CardDescription>
            Your savings and withdrawal history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Transaction History</span>
          </CardTitle>
          <CardDescription>
            Your savings and withdrawal history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Transactions Yet
            </h3>
            <p className="text-muted-foreground">
              Your transaction history will appear here once you create locks or make withdrawals.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
    
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full bg-muted ${getTransactionColor(transaction)}`}>
                  {getTransactionIcon(transaction)}
                </div>
                <div>
                  <p className="font-medium">
                    {transaction.type === 'lock_created' && `Lock #${transaction.lockId} Created`}
                    {transaction.type === 'withdrawal' && `Lock #${transaction.lockId} Withdrawn`}
                    {transaction.type === 'early_withdrawal' && `Lock #${transaction.lockId} Early Withdrawal`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.timestamp)}
                  </p>
                  {transaction.reason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {transaction.reason}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className={`font-medium ${getTransactionColor(transaction)}`}>
                      {transaction.type === 'lock_created' ? '+' : '-'}
                      {formatTokenAmount(transaction.amount)}{" "}
                      {getTokenInfo(transaction.token).symbol}
                    </p>
                    <Badge 
                      variant={
                        transaction.type === 'early_withdrawal' ? 'destructive' : 
                        transaction.type === 'withdrawal' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {transaction.type === 'lock_created' && 'Locked'}
                      {transaction.type === 'withdrawal' && 'Withdrawn'}
                      {transaction.type === 'early_withdrawal' && 'Early Withdrawal'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ≈ $
                    {formatUsdAmount(transaction.amount, transaction.token)}
                  </p>
                </div>
                {transaction.penaltyAmount && transaction.penaltyAmount > 0n && (
                  <p className="text-xs text-red-600 mt-1">
                    Penalty: -
                    {formatTokenAmount(transaction.penaltyAmount)}{" "}
                    {getTokenInfo(transaction.token).symbol}
                  </p>
                )}
                {transaction.isEarlyWithdrawal && (
                  <p className="text-xs text-orange-600 mt-1">
                    Early withdrawal penalty applied
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
