import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { findInvite } from "@/lib/sponsoring";
import { findUserById } from "@/lib/users";

// Stellar can take a while; Vercel stops functions after 10 seconds by default.
export const maxDuration = 60;

export const metadata: Metadata = { title: "Create account · juno" };

// "/signup?as=sponsor" is where "Start sponsoring" leads; "/signup?invite=..." is a sponsor's invite link.
export default function SignUp(props: PageProps<"/signup">) {
  return (
    <Suspense>
      <Form searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Form({ searchParams }: Pick<PageProps<"/signup">, "searchParams">) {
  const query = await searchParams;
  if (query.as === "sponsor") return <AuthForm mode="signup" role="sponsor" />;

  const invite = typeof query.invite === "string" ? await findInvite(query.invite) : undefined;
  const sponsor = invite && !invite.learnerId ? await findUserById(invite.sponsorId) : undefined;
  return (
    <AuthForm
      mode="signup"
      invite={sponsor && invite?.token ? { token: invite.token, note: `${sponsor.name} is sponsoring your learning. Create your account to get started.` } : undefined}
    />
  );
}
