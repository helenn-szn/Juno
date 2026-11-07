"use client";

import { countries } from "@/lib/countries";

/** A country dropdown. It takes its look from the form-field rule in styles/juno.css. */
export function CountrySelect({ value, onChange, error }: { value: string; onChange: (country: string) => void; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="country" className="text-body-medium">
        Country<span className="text-text-error-primary"> *</span>
      </label>
      <select
        id="country"
        name="country"
        required
        autoComplete="country-name"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "country-error" : undefined}
        className="w-full"
      >
        <option value="" disabled>
          Select your country
        </option>
        {countries.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {error && (
        <span id="country-error" role="alert" className="text-body-2-regular text-text-error-primary">
          {error}
        </span>
      )}
    </div>
  );
}
