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
import { ProfileEditModal } from "../../components/profile-edit-modal";
import { AccountDeactivationModal } from "../../components/account-deactivation-modal";
import { SAFELOCK_CONTRACT } from "../../lib/contracts";
import {
  AlertCircle,
  Loader2,
  Settings,
  User,
  AlertTriangle,
  ArrowLeft,
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
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your profile information and account settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Display */}
          <div className="lg:col-span-2">
            <ProfileDisplay />
          </div>

          {/* Profile Actions */}
          <div className="space-y-6">
            {/* Profile Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Management
                </CardTitle>
                <CardDescription>
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileEditModal>
                  <Button className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </ProfileEditModal>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Emergency Options</h4>
                  <p className="text-xs text-muted-foreground">
                    Use these options only in emergency situations
                  </p>
                </div>
                <AccountDeactivationModal>
                  <Button className="w-full" variant="destructive">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Deactivate Account
                  </Button>
                </AccountDeactivationModal>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Wallet Address</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Registration</span>
                  <span className="text-sm font-medium">Complete</span>
                </div>
              </CardContent>
            </Card>
          </div>
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
