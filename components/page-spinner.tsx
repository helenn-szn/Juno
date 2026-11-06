import { Spinner } from "@/components/base/spinner/spinner";

export function PageSpinner() {
  return (
    <div className="flex justify-center py-16">
      <Spinner aria-label="Loading" />
    </div>
  );
}
