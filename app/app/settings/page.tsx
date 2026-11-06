import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { logOut } from "@/app/actions";
import { AvatarUpload } from "@/components/avatar-upload";
import { Button } from "@/components/base/buttons/button";
import { PageSpinner } from "@/components/page-spinner";
import { TopBar } from "@/components/top-bar";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Settings · juno" };

export default function Settings() {
  return (
    <>
      <TopBar title="Settings" />
      <Suspense fallback={<PageSpinner />}>
        <Account />
      </Suspense>
    </>
  );
}

async function Account() {
  const user = await currentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex max-w-120 flex-col gap-6 p-6 lg:p-7">
      <AvatarUpload name={user.name} src={user.avatar} />
      <dl className="flex flex-col divide-y divide-line rounded-2xl border border-line">
        <div className="flex flex-col gap-0.5 px-5 py-4">
          <dt className="text-body-2-regular text-text-tertiary">Name</dt>
          <dd className="text-copy-sm">{user.name}</dd>
        </div>
        <div className="flex flex-col gap-0.5 px-5 py-4">
          <dt className="text-body-2-regular text-text-tertiary">Email</dt>
          <dd className="text-copy-sm break-all">{user.email}</dd>
        </div>
      </dl>
      <form action={logOut}>
        <Button type="submit" variant="secondary" className="h-11 rounded-full px-5 shadow-none">
          Log out
        </Button>
      </form>
    </div>
  );
}
