import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create account · juno" };

export default function SignUp() {
  return <AuthForm mode="signup" />;
}
