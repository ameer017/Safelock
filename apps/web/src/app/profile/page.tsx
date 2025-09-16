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
          <div className="lg:col-span-2">
            <ProfileDisplay />
          </div>

          <div className="space-y-6">
            <CardContent>
              <ProfileEditModal>
                <Button className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </ProfileEditModal>
            </CardContent>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
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
