import { useId, useState, type FormEvent } from "react";
import type { BasePostcodeResult } from "../../api/leads";
import { Button } from "../ui/Button";
import { inputClassName } from "../ui/inputStyles";

interface BasePostcodeFormProps {
  /** The saved base postcode, or null until one is set. */
  postcode: string | null;
  onSave: (postcode: string) => Promise<BasePostcodeResult>;
}

/**
 * Where leads are measured from (KES-26). The message area is always there, two lines tall, so an
 * error or "Saved" doesn't push the page about.
 */
export function BasePostcodeForm({ postcode, onSave }: BasePostcodeFormProps) {
  const id = useId();
  const [value, setValue] = useState(postcode ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(null);
    if (!value.trim()) return setError("Enter your postcode.");

    setSending(true);
    setError(null);
    let result: BasePostcodeResult;
    try {
      result = await onSave(value);
    } catch {
      result = { ok: false, message: "We couldn't reach Kestlow. Please try again in a minute." };
    }
    setSending(false);
    if (result.ok) {
      setValue(result.postcode);
      setSaved(`Saved. Leads are now measured from ${result.postcode}.`);
    } else setError(result.message);
  }

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="py-3.5">
      <label htmlFor={`${id}-postcode`} className="block font-bold">
        Base postcode
      </label>
      <p id={`${id}-hint`} className="m-0 mt-0.5 text-sm text-muted">
        {postcode
          ? "Leads are measured from here."
          : "Not set yet, so leads are measured from central Bromley."}
      </p>
      <div className="flex items-end gap-2">
        <input
          id={`${id}-postcode`}
          name="postcode"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="postal-code"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-hint ${id}-message`}
          className={inputClassName(Boolean(error), "max-w-[12rem] uppercase")}
        />
        <Button type="submit" disabled={sending} className="shrink-0">
          {sending ? "Saving…" : "Save"}
        </Button>
      </div>
      <p
        id={`${id}-message`}
        role="status"
        className={`m-0 mt-1.5 min-h-[2lh] text-sm font-semibold ${error ? "text-error" : "text-ink"}`}
      >
        {error ?? saved}
      </p>
    </form>
  );
}
