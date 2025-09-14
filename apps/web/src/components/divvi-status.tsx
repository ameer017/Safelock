"use client"

import { useDivviStatus } from '@/hooks/use-divvi'
import { Alert, AlertDescription } from './ui/alert'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'
import { Badge } from './ui/badge'

export function DivviStatus() {
  const { isDivviAvailable, isWalletConnected, userAddress, canTrackReferrals } = useDivviStatus()

  if (!isDivviAvailable) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Divvi referral tracking is not available. Please ensure you&apos;re using a compatible browser with an Ethereum provider.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant={canTrackReferrals ? "default" : "secondary"}>
          Divvi Integration
        </Badge>
        <Badge variant={isWalletConnected ? "default" : "outline"}>
          Wallet {isWalletConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>Referral tracking is active with consumer address:</p>
            <code className="bg-muted px-2 py-1 rounded text-xs block">
              0xCf7D46393309a9e46B0a3AC3f6fB8A3cA3B5C029
            </code>
            {userAddress && (
              <p className="text-sm">
                Your address: <code className="bg-muted px-1 rounded text-xs">{userAddress}</code>
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {canTrackReferrals && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            All your SafeLock transactions will be automatically tracked for referral rewards!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
