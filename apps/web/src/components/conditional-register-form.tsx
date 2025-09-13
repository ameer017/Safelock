"use client"

import { useAccount, useReadContract } from "wagmi"
import { SAFELOCK_CONTRACT } from "../lib/contracts"
import { RegisterForm } from "./register-form-wrapper"
import { useEffect, useState } from "react"

function ConditionalRegisterFormInner() {
  const { address, isConnected } = useAccount()
  
  // Check if user is already registered
  const { data: isRegistered } = useReadContract({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: "isUserRegistered",
    args: address ? [address] : undefined
  })


  if (!isConnected || isRegistered) {
    return null
  }

  return <RegisterForm />
}

export function ConditionalRegisterForm() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <ConditionalRegisterFormInner />
}
