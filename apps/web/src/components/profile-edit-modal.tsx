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
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { SAFELOCK_CONTRACT } from "../lib/contracts";
import { User, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface ProfileEditModalProps {
  children: React.ReactNode;
}

export function ProfileEditModal({ children }: ProfileEditModalProps) {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImageHash, setProfileImageHash] = useState("");
  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  // Get current user profile
  const { data: userProfile, isLoading: isLoadingProfile } = useReadContract({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: "getUserProfile",
    args: address ? [address] : undefined,
  });

  // Check username availability
  const { refetch: checkUsername } = useReadContract({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: "isUsernameAvailable",
    args: username.length >= 3 ? [username] : undefined,
    query: { enabled: false },
  });

  // Initialize form with current profile data
  useEffect(() => {
    if (userProfile && open) {
      setUsername(userProfile.username || "");
      setProfileImageHash(userProfile.profileImageHash || "");
    }
  }, [userProfile, open]);

  // Check username availability when it changes
  useEffect(() => {
    if (username.length >= 3) {
      const timeoutId = setTimeout(async () => {
        if (username !== userProfile?.username) {
          setIsUsernameChecking(true);
          try {
            const result = await checkUsername();
            setIsUsernameAvailable(result.data as boolean);
          } catch (error) {
            console.error("Error checking username:", error);
            setIsUsernameAvailable(null);
          } finally {
            setIsUsernameChecking(false);
          }
        } else {
          setIsUsernameAvailable(true); // Current username is always available
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setIsUsernameAvailable(null);
    }
  }, [username, userProfile?.username, checkUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to update your profile.",
        variant: "destructive",
      });
      return;
    }

    if (username.length < 3) {
      toast({
        title: "Invalid Username",
        description: "Username must be at least 3 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (isUsernameAvailable === false) {
      toast({
        title: "Username Not Available",
        description: "Please choose a different username.",
        variant: "destructive",
      });
      return;
    }

    try {
      writeContract({
        address: SAFELOCK_CONTRACT.address,
        abi: SAFELOCK_CONTRACT.abi,
        functionName: "updateProfile",
        args: [username, profileImageHash],
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle successful update
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setOpen(false);
    }
  }, [isSuccess, toast]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const getUsernameStatus = () => {
    if (isUsernameChecking) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking availability...
        </div>
      );
    }

    if (username.length > 0 && username.length < 3) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          Username must be at least 3 characters
        </div>
      );
    }

    if (isUsernameAvailable === true) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          Username is available
        </div>
      );
    }

    if (isUsernameAvailable === false) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          Username is already taken
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your username and profile information.
          </DialogDescription>
        </DialogHeader>

        {isLoadingProfile ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                minLength={3}
                maxLength={32}
              />
              {getUsernameStatus()}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileImageHash">Profile Image Hash (IPFS)</Label>
              <Input
                id="profileImageHash"
                value={profileImageHash}
                onChange={(e) => setProfileImageHash(e.target.value)}
                placeholder="Optional: IPFS hash for profile image"
              />
              <p className="text-xs text-muted-foreground">
                You can upload an image to IPFS and paste the hash here
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error.message || "Failed to update profile"}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  username.length < 3 ||
                  isUsernameAvailable === false ||
                  isUsernameChecking ||
                  (username === userProfile?.username && profileImageHash === userProfile?.profileImageHash)
                }
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
