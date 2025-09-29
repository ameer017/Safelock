"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { SAFELOCK_CONTRACT } from "../lib/contracts";
import { registerUser } from "../lib/safelock-contract";
import { getOperationErrorMessage, OPERATIONS } from "../lib/error-utils";
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
  const [localError, setLocalError] = useState<string | null>(null);
  const [checkUsername, setCheckUsername] = useState<string>("");

  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { writeContract, isPending, isError, error, data: writeData } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

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
      setLocalError("Please connect your wallet first");
      return;
    }

    setLocalError(null);

    try {
      // Use simplified registration function
      const contractData = registerUser(
        data.username,
        data.profileImageHash || ""
      );
      
      writeContract(contractData);
      
    } catch (error) {
      console.error("Registration error:", error);
      setLocalError("Failed to register user. Please try again.");
    }
  };

  // Reset form and navigate to dashboard when transaction is successful
  useEffect(() => {
    if (isSuccess && txHash) {
      setIsOpen(false);
      reset();
      setLocalError(null);
      setTxHash(undefined);
      // Navigate to dashboard after successful registration
      router.push("/dashboard");
    }
  }, [isSuccess, txHash, reset, router]);

  // Capture transaction hash when writeData changes
  useEffect(() => {
    if (writeData && typeof writeData === 'string') {
      setTxHash(writeData);
    }
  }, [writeData]);

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

        {(localError || isError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="break-words">
              {localError || getOperationErrorMessage(OPERATIONS.REGISTER, error)}
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
