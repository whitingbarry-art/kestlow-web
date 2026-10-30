import { Component, type ErrorInfo, type ReactNode } from "react";
import { CONTACT } from "../data/contact";
import type { ErrorReporter } from "../logic/errorReporting";
import { PublicLayout } from "./site/PublicLayout";
import { buttonClassName } from "./ui/buttonStyles";

interface ErrorBoundaryProps {
  reporter: ErrorReporter;
  children: ReactNode;
}

/**
 * If a page breaks while drawing, shows a friendly way out instead of a blank screen, and reports
 * what broke (KES-38). React needs a class component for this.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { broken: boolean }> {
  state = { broken: false };

  static getDerivedStateFromError() {
    return { broken: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (info.componentStack)
      error.stack = `${error.stack ?? ""}\nComponents:${info.componentStack}`;
    this.props.reporter.report(error);
  }

  render() {
    if (!this.state.broken) return this.props.children;
    return (
      <PublicLayout title="Something went wrong">
        <p className="mt-0 mb-6 text-lg leading-relaxed">
          Sorry, this page broke. We've been told about it automatically, and reloading usually
          sorts it out.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={buttonClassName("primary", "px-6")}
        >
          Reload the page
        </button>
        <p className="mt-6 mb-0 text-muted">
          Still not working? Email{" "}
          <a href={`mailto:${CONTACT.support}`} className="font-semibold text-ink underline">
            {CONTACT.support}
          </a>{" "}
          and we'll help.
        </p>
      </PublicLayout>
    );
  }
}
