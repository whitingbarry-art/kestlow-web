import { Button } from "./Button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="mx-4 my-6 text-center">
      <p className="mt-0 mb-3">{message}</p>
      <Button variant="ghost" className="w-full" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
