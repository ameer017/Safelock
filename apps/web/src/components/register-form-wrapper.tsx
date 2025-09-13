"use client"

import dynamic from "next/dynamic"
import { Button } from "./ui/button"

const RegisterFormInner = dynamic(() => import("./register-form").then(mod => ({ default: mod.RegisterFormInner })), {
  ssr: false,
  loading: () => <Button disabled>Register</Button>
})

export function RegisterForm() {
  return <RegisterFormInner />
}
