interface SectionTitleProps {
  children: string;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="mx-4 mt-[18px] text-[13px] font-bold tracking-[0.5px] text-muted uppercase">
      {children}
    </div>
  );
}
