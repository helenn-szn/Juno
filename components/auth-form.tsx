"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Form } from "react-aria-components";
import { logIn, signUp, type FormState } from "@/app/actions";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CoinFan } from "@/components/coin-fan";
import { touchInput } from "@/components/touch-input";

const modes = {
  signup: {
    title: "Create your account",
    action: signUp,
    submit: "Create account",
    pending: "Creating your account…",
    switch: { text: "Already have an account?", link: "Log in", href: "/login" },
  },
  login: {
    title: "Welcome back",
    action: logIn,
    submit: "Log in",
    pending: "Logging you in…",
    switch: { text: "New to Juno?", link: "Create account", href: "/signup" },
  },
};

const showErrors = ({ validationErrors }: { validationErrors: string[] }) => validationErrors.join(" ");

export function AuthForm({ mode, role = "learner" }: { mode: keyof typeof modes; role?: "learner" | "sponsor" }) {
  const sponsor = role === "sponsor" && mode === "signup";
  const m = sponsor ? { ...modes.signup, title: "Create your sponsor account" } : modes[mode];
  const [state, action, pending] = useActionState<FormState, FormData>(m.action, {});

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col gap-8 px-6 py-6">
      <Link href="/" className="flex min-h-11 items-center gap-1.5 self-start rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
        <CoinFan className="h-6 w-8.5" />
        <span className="text-title-3-medium text-text-accent">juno</span>
      </Link>

      <div className="my-auto flex flex-col gap-6">
        <h1 className="text-title-1-medium">{m.title}</h1>
        <Form action={action} validationBehavior="aria" validationErrors={state.errors} className="flex flex-col gap-4">
          {sponsor && <input type="hidden" name="role" value="sponsor" />}
          {mode === "signup" && (
            <Input
              name="name"
              label={sponsor ? "Name or organisation" : "Name"}
              autoComplete="name"
              isRequired
              defaultValue={state.values?.name}
              errorMessage={showErrors}
              {...touchInput}
            />
          )}
          <Input
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            isRequired
            defaultValue={state.values?.email}
            errorMessage={showErrors}
            {...touchInput}
          />
          <Input
            name="password"
            type="password"
            label="Password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            isRequired
            errorMessage={showErrors}
            {...touchInput}
          />
          <Button type="submit" disabled={pending} className="mt-2 h-12 w-full rounded-full shadow-none">
            {pending ? m.pending : m.submit}
          </Button>
        </Form>
        <p className="flex flex-wrap items-center gap-x-2 text-body-regular text-text-secondary">
          {m.switch.text}
          <Link href={m.switch.href} className="inline-flex min-h-11 items-center text-text-accent underline">{m.switch.link}</Link>
        </p>
      </div>
    </main>
  );
}
