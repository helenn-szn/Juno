import { AppHeader } from "@/components/app-header";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-6 py-6">
      <AppHeader />
      {children}
    </div>
  );
}
