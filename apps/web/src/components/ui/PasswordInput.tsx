import { useState, type InputHTMLAttributes } from "react";
import { inputClassName } from "./inputStyles";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Starts hidden; set it to false after a submit to hide the password again. */
  shown?: boolean;
  onShownChange?: (shown: boolean) => void;
}

/**
 * A password box with an eye button to show or hide what's typed. The button keeps one label,
 * "Show password", and says whether it's on with aria-pressed, so screen readers hear
 * "Show password, toggle button, pressed".
 */
export function PasswordInput({ shown, onShownChange, className, ...props }: PasswordInputProps) {
  const [ownShown, setOwnShown] = useState(false);
  const visible = shown ?? ownShown;
  const toggle = () => {
    setOwnShown(!visible);
    onShownChange?.(!visible);
  };

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        autoCapitalize="none"
        spellCheck={false}
        className={inputClassName(false, `pr-12 ${className ?? ""}`)}
      />
      <button
        type="button"
        aria-label="Show password"
        aria-pressed={visible}
        aria-controls={props.id}
        onClick={toggle}
        className="absolute right-1 bottom-0.5 grid size-11 place-items-center rounded-xl text-muted hover:text-ink"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {visible && <path d="M4 4l16 16" />}
        </svg>
      </button>
    </div>
  );
}
