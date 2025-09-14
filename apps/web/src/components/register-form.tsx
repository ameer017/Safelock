"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useAccount,
  useReadContract,
} from "wagmi";
import { SAFELOCK_CONTRACT } from "../lib/contracts";
import { useDivvi } from "../hooks/use-divvi";
import { registerUserWithReferral } from "../lib/safelock-contract";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be less than 32 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  profileImageHash: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterFormInner() {
  const [isOpen, setIsOpen] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [checkUsername, setCheckUsername] = useState<string>("");

  const { address, isConnected } = useAccount();
  const { isAvailable: isDivviAvailable } = useDivvi();
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [writeError, setWriteError] = useState<Error | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedUsername = watch("username");

  // Check if user is already registered
  const { data: isRegistered } = useReadContract({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: "isUserRegistered",
    args: address ? [address] : undefined,
  });

  // Check username availability
  const { data: usernameAvailableData } = useReadContract({
      address: SAFELOCK_CONTRACT.address,
      abi: SAFELOCK_CONTRACT.abi,
      functionName: "isUsernameAvailable",
      args:
        checkUsername && checkUsername.length >= 3
          ? [checkUsername]
          : undefined,
      query: {
        enabled: checkUsername.length >= 3,
      },
    });

  // Check username availability by calling the contract
  const checkUsernameAvailability = (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      setCheckUsername("");
      return;
    }

    setCheckUsername(username);
  };

  // Handle username availability response
  useEffect(() => {
    if (usernameAvailableData !== undefined) {
      setUsernameAvailable(usernameAvailableData as boolean);
    }
  }, [usernameAvailableData]);

  // Watch username field and check availability
  useEffect(() => {
    if (watchedUsername) {
      checkUsernameAvailability(watchedUsername);
    }
  }, [watchedUsername]);

  const onSubmit = async (data: RegisterFormData) => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setError(null);
    setWriteError(null);
    setIsPending(true);
    setIsConfirming(false);
    setIsSuccess(false);

    try {
      // Use Divvi-integrated registration function
      await registerUserWithReferral(
        address!,
        data.username,
        data.profileImageHash || ""
      );
      
      setIsPending(false);
      setIsConfirming(true);
      
      // Simulate waiting for confirmation (in a real app, you'd use wagmi's useWaitForTransactionReceipt)
      // For now, we'll just set success after a short delay
      setTimeout(() => {
        setIsConfirming(false);
        setIsSuccess(true);
      }, 3000);
      
    } catch (error) {
      console.error("Registration error:", error);
      setIsPending(false);
      setIsConfirming(false);
      setWriteError(error as Error);
      setError("Failed to register user. Please try again.");
    }
  };

  // Reset form when transaction is successful
  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
      reset();
      setError(null);
    }
  }, [isSuccess, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Register</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Register on SafeLock
          </DialogTitle>
          <DialogDescription>
            Create your decentralized savings account on Celo
          </DialogDescription>
        </DialogHeader>

        {!isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to register on SafeLock
            </AlertDescription>
          </Alert>
        )}

        {isConnected && isRegistered && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You are already registered on SafeLock! You can start saving now.
            </AlertDescription>
          </Alert>
        )}

        {isDivviAvailable && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Referral tracking enabled - your registration will be tracked for rewards!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {writeError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Transaction failed: {writeError.message}
            </AlertDescription>
          </Alert>
        )}

        {isSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully registered! You can now start saving on SafeLock.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder="Enter your username (3-32 characters)"
                {...register("username", {
                  onChange: (e) => {
                    const username = e.target.value;
                    if (username.length >= 3) {
                      checkUsernameAvailability(username);
                    } else {
                      setUsernameAvailable(null);
                    }
                  },
                })}
                className={errors.username ? "border-destructive" : ""}
                disabled={isPending || isConfirming}
              />
              {watchedUsername && watchedUsername.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameAvailable === true && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {usernameAvailable === false && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
            {watchedUsername &&
              watchedUsername.length >= 3 &&
              usernameAvailable !== null && (
                <p
                  className={`text-sm ${
                    usernameAvailable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {usernameAvailable
                    ? "Username is available"
                    : "Username is taken"}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileImageHash">
              Profile Image Hash (Optional)
            </Label>
            <Input
              id="profileImageHash"
              placeholder="IPFS hash for your profile image"
              {...register("profileImageHash")}
              disabled={isPending || isConfirming}
            />
            <p className="text-xs text-muted-foreground">
              Upload your image to IPFS and paste the hash here
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                By registering, you agree to use SafeLock&apos;s decentralized
                savings platform.
              </p>
              <p className="mt-1">
                Your wallet address:{" "}
                <code className="bg-muted px-1 rounded text-xs">{address}</code>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                !isConnected ||
                isPending ||
                isConfirming ||
                usernameAvailable === false ||
                isRegistered
              }
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? "Confirm in wallet..." : "Processing..."}
                </>
              ) : isRegistered ? (
                "Already Registered"
              ) : (
                "Register on SafeLock"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
