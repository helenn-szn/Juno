import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

// Stellar can take a while; Vercel stops functions after 10 seconds by default.
export const maxDuration = 60;

export const metadata: Metadata = { title: "Create account · juno" };

// "/signup?as=sponsor" is where "Start sponsoring" leads.
export default function SignUp(props: PageProps<"/signup">) {
  return (
    <Suspense>
      <Form searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Form({ searchParams }: Pick<PageProps<"/signup">, "searchParams">) {
  const sponsor = (await searchParams).as === "sponsor";
  return <AuthForm mode="signup" role={sponsor ? "sponsor" : "learner"} />;
}
