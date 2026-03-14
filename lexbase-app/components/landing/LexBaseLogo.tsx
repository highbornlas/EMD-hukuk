/* ═══════════════════════════════════════════════════════════════
   LexBase SVG Logo — Kalkan + Stilize "L" + Terazi
   variant: 'full' → ikon + LexBase yazısı
   variant: 'icon' → sadece kalkan ikonu
   ═══════════════════════════════════════════════════════════════ */

interface LexBaseLogoProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'icon';
}

export function LexBaseLogo({ size = 40, className = '', variant = 'icon' }: LexBaseLogoProps) {
  const shield = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={variant === 'icon' ? className : ''}
    >
      {/* Kalkan (Shield) */}
      <path
        d="M32 4L8 16v16c0 14.4 10.24 27.84 24 32 13.76-4.16 24-17.6 24-32V16L32 4z"
        fill="url(#shieldGrad)"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* İç kalkan gölge */}
      <path
        d="M32 8L12 18v14c0 12.6 8.96 24.36 20 28 11.04-3.64 20-15.4 20-28V18L32 8z"
        fill="#0B0F19"
        opacity="0.7"
      />
      {/* Terazi — üst yatay çubuk */}
      <line x1="22" y1="22" x2="42" y2="22" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
      {/* Terazi — dikey çubuk */}
      <line x1="32" y1="18" x2="32" y2="26" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
      {/* Terazi — sol kefe */}
      <path d="M22 22c-1 3-1 5 0 7h0" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M19 29h6" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
      {/* Terazi — sağ kefe */}
      <path d="M42 22c1 3 1 5 0 7h0" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M39 29h6" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
      {/* Stilize "L" harfi */}
      <text
        x="32"
        y="48"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="22"
        fontWeight="bold"
        fill="#D4AF37"
      >
        L
      </text>
      {/* Gradient tanımları */}
      <defs>
        <linearGradient id="shieldGrad" x1="8" y1="4" x2="56" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.05" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (variant === 'icon') return shield;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {shield}
      <span className="font-[var(--font-playfair)] text-xl font-bold tracking-tight">
        <span className="text-[#D4AF37]">Lex</span>
        <span className="text-white">Base</span>
      </span>
    </div>
  );
}
