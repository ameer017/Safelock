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
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ProfileDisplay } from "../../components/profile-display";
import { AccountDeactivationModal } from "../../components/account-deactivation-modal";
import { SAFELOCK_CONTRACT } from "../../lib/contracts";
import {
  AlertCircle,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Activity,
} from "lucide-react";

function ProfileContent() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const { data: isRegistered, isLoading: isCheckingRegistration } =
    useReadContract({
      address: SAFELOCK_CONTRACT.address,
      abi: SAFELOCK_CONTRACT.abi,
      functionName: "isUserRegistered",
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
        <div className="container mx-auto max-w-4xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access your profile
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  if (isCheckingRegistration) {
    return (
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading your profile...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isRegistered) {
    return (
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-4xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to register on SafeLock to access your profile. Please
              register first.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Profile Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your profile information and account settings.
              </p>
            </div>
            <AccountDeactivationModal>
              <Button variant="destructive">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Deactivate Account
              </Button>
            </AccountDeactivationModal>
          </div>
        </div>

        <div className="space-y-6">
          <ProfileDisplay />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Login Logs
              </CardTitle>
              <CardDescription>
                Your most recent login activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">11 minutes ago</p>
                    <p className="text-xs text-muted-foreground">IP: 192.168.1.1</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Previous Session</p>
                      <p className="text-xs text-muted-foreground">Logged out</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                    <p className="text-xs text-muted-foreground">IP: 192.168.1.1</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Previous Session</p>
                      <p className="text-xs text-muted-foreground">Logged out</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                    <p className="text-xs text-muted-foreground">IP: 192.168.1.2</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function Profile() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading profile page...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <ProfileContent />;
}
