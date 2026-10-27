interface BrandLogoProps {
  size?: number;
}

/** The logo, which links to the home page from every page that shows it. */
export function BrandLogo({ size = 36 }: BrandLogoProps) {
  return (
    <a
      href="/"
      aria-label="Kestlow home"
      className="inline-flex items-center gap-2.5 rounded-xl text-[22px] font-bold tracking-[-0.5px] text-white no-underline"
    >
      {/* A roof for building work over an amber K, with the amber dot at the ridge. */}
      <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
        <g fill="none" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 46 L48 16 L84 46" stroke="#fff" />
          <g stroke="#F5A623">
            <path d="M38 46 V80" />
            <path d="M38 63 L56 48" />
            <path d="M38 63 L60 80" />
          </g>
        </g>
        <circle cx="48" cy="16" r="8" fill="#F5A623" />
      </svg>
      Kestlow
    </a>
  );
}
