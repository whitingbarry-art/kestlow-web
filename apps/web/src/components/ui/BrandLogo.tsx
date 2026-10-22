interface BrandLogoProps {
  size?: number;
}

export function BrandLogo({ size = 36 }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-2.5 text-[22px] font-bold tracking-[-0.5px] text-white">
      <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
        <rect width="96" height="96" rx="22" fill="#fff" fillOpacity=".14" />
        <g fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
          <path d="M34 24 V72" />
          <path d="M34 50 L58 28" />
          <path d="M34 50 L64 72" />
        </g>
        <circle cx="68" cy="24" r="7.5" fill="#F5A623" />
      </svg>
      Kestlow
    </div>
  );
}
