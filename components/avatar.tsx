// A round picture of her, or her first letter when she hasn't added one.
import { cx } from "@/utils/cx";

export function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  return (
    <span className={cx("flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple text-headline-medium text-dark-green", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- her own upload, already shrunk
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
}
