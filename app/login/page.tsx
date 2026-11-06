import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

// Stellar can take a while; Vercel stops functions after 10 seconds by default.
export const maxDuration = 60;

export const metadata: Metadata = { title: "Log in · juno" };

export default function LogIn() {
  return <AuthForm mode="login" />;
}
