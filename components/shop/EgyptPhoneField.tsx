"use client";

import {
  egyptLocalFromNational,
  egyptNationalInput,
  egyptPhoneHint,
  isValidEgyptMobile,
} from "@/lib/phone";
import { useUi } from "@/lib/ui";

type Props = {
  label: string;
  value: string;
  onChange: (localPhone: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function EgyptPhoneField({
  label,
  value,
  onChange,
  required,
  placeholder = "10xxxxxxxx",
}: Props) {
  const { lang } = useUi();
  const national = egyptNationalInput(value);
  const touched = value.length > 0;
  const valid = isValidEgyptMobile(value);
  const showError = touched && !valid;

  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      <div
        className={`flex min-h-12 items-stretch overflow-hidden rounded-xl border bg-input-background transition ${
          showError
            ? "border-error focus-within:border-error"
            : "border-input-border focus-within:border-primary"
        }`}
      >
        <span
          className="inline-flex shrink-0 items-center gap-1.5 border-e border-input-border bg-chip px-3 text-sm font-bold"
          dir="ltr"
          aria-hidden
        >
          <span className="text-base leading-none" title="Egypt">
            🇪🇬
          </span>
          <span className="tabular-nums text-foreground">+20</span>
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required={required}
          value={national}
          dir="ltr"
          placeholder={placeholder}
          aria-invalid={showError}
          aria-describedby={showError ? "eg-phone-hint" : undefined}
          onChange={(e) => onChange(egyptLocalFromNational(e.target.value))}
          className="min-h-12 w-full bg-transparent px-3 py-2.5 text-base outline-none"
        />
      </div>
      {showError ? (
        <p id="eg-phone-hint" className="mt-1.5 text-xs font-semibold text-error">
          {egyptPhoneHint(lang)}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-muted" dir="ltr">
          +20 · {national || "1xxxxxxxxx"}
        </p>
      )}
    </label>
  );
}
