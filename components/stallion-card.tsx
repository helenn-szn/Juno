import { ButtonLink } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

export function StallionCard({ className }: { className?: string }) {
  return (
    <div className={cx("flex flex-col gap-2.5 rounded-2xl bg-purple p-4.5 text-dark-green", className)}>
      <p className="text-headline-medium">Ready to work?</p>
      <ButtonLink
        href="https://stallion.so"
        className="h-11 rounded-full bg-dark-green px-4 text-mint shadow-none [background-image:none] hover:bg-dark-green/80"
      >
        Find work on Stallion
      </ButtonLink>
    </div>
  );
}
