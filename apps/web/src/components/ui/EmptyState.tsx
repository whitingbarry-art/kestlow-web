interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return <div className="mx-4 my-6 text-center text-muted">{message}</div>;
}
