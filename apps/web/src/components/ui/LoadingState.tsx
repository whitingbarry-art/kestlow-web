interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div role="status" className="mx-4 my-6 text-center text-muted">
      {message}
    </div>
  );
}
