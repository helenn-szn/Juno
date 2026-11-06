import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Log in · juno" };

export default function LogIn() {
  return <AuthForm mode="login" />;
}
