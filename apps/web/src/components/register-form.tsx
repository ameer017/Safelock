"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react"

const registerSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const watchedUsername = watch("username")

  // Simulate username availability check
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setUsernameAvailable(Math.random() > 0.3) // 70% chance of being available
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log("Registration data:", data)
      setIsOpen(false)
      reset()
    } catch (error) {
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Register</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create Account
          </DialogTitle>
          <DialogDescription>
            Join Cartridge and start your decentralized journey
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder="Enter your username"
                {...register("username", {
                  onChange: (e) => {
                    const username = e.target.value
                    if (username.length >= 3) {
                      checkUsernameAvailability(username)
                    } else {
                      setUsernameAvailable(null)
                    }
                  }
                })}
                className={errors.username ? "border-destructive" : ""}
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
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
            {watchedUsername && watchedUsername.length >= 3 && usernameAvailable !== null && (
              <p className={`text-sm ${
                usernameAvailable ? "text-green-600" : "text-red-600"
              }`}>
                {usernameAvailable ? "Username is available" : "Username is taken"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="rounded border-input"
                required
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || usernameAvailable === false}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="#" className="text-primary hover:underline">
            Sign in
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
