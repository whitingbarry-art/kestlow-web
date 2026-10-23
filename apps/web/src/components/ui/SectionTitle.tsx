interface SectionTitleProps {
  children: string;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="mx-4 mt-[18px] mb-0 text-[13px] font-bold tracking-[0.5px] text-muted uppercase">
      {children}
    </h2>
  );
}
