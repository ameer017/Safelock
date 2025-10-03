"use client";

import { useAccount, useReadContract } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { ProfileEditModal } from "./profile-edit-modal";
import { SAFELOCK_CONTRACT } from "../lib/contracts";
import {
  User,
  Calendar,
  Activity,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

interface ProfileDisplayProps {
  className?: string;
}

export function ProfileDisplay({ className }: ProfileDisplayProps) {
  const { address, isConnected } = useAccount();

  const { data: userProfile, isLoading: isLoadingProfile } = useReadContract({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: "getUserProfile",
    args: address ? [address] : undefined,
  });

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to view your profile
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingProfile) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile?.isActive) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Profile not found. Please register to create your profile.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatLastActivity = (timestamp: bigint) => {
    const now = Date.now() / 1000;
    const activityTime = Number(timestamp);
    const diffInSeconds = now - activityTime;

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }
  };

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {userProfile.profileImageHash ? (
              <AvatarFallback>
                <ImageIcon className="h-8 w-8" />
              </AvatarFallback>
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(userProfile.username)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-start gap-4">
              <h3 className="text-xl font-semibold">{userProfile.username}</h3>
              <Badge variant={userProfile.isActive ? "default" : "secondary"} className="bg-green-500">
                {userProfile.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{address}</p>
          </div>
          <div className="flex-shrink-0">
            <ProfileEditModal>
              <Button>
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </ProfileEditModal>
          </div>
        </div>

        <div className="flex justify-between flex-wrap w-full">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Registered:</span>
            <span className="font-medium">
              {formatDate(userProfile.registrationDate)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last Active:</span>
            <span className="font-medium">
              {formatLastActivity(userProfile.lastActivity)}
            </span>
          </div>
        </div>

        {userProfile.profileImageHash && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Profile Image Hash</h4>
            <div className="p-3 bg-muted rounded-md">
              <code className="text-xs break-all">
                {userProfile.profileImageHash}
              </code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
