interface Props {
  className?: string;
  color?: string;
  size?: number;
}

export function KazakhCorner({ className = "", color = "#D4AF37", size = 48 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      {/* Қошқар мүйіз — ram's horns motif */}
      <path
        d="M4 4 C4 4 14 4 14 14 C14 20 8 22 8 28 C8 36 16 40 24 40"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M4 4 C4 4 4 14 14 14 C20 14 22 8 28 8 C36 8 40 16 40 24"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <circle cx="4" cy="4" r="2" fill={color} opacity="0.9" />
      <circle cx="14" cy="14" r="1.5" fill={color} opacity="0.6" />
    </svg>
  );
}

export function KazakhDivider({ color = "#D4AF37", className = "" }: { color?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-px opacity-20" style={{ background: `linear-gradient(90deg,transparent,${color})` }} />
      <svg width="32" height="16" viewBox="0 0 32 16" fill={color} opacity={0.5}>
        <path d="M16 1 L19 6 L25 6 L20 10 L22 15 L16 12 L10 15 L12 10 L7 6 L13 6 Z" />
      </svg>
      <div className="flex-1 h-px opacity-20" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
    </div>
  );
}

export function KazakhCardBorder({ children, accent = "#00AFCA", className = "" }: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-px ${className}`}
      style={{ background: `linear-gradient(135deg,${accent}44,transparent,${accent}22)` }}
    >
      <div className="rounded-2xl bg-zinc-900 h-full w-full">
        {/* Corner ornaments */}
        <KazakhCorner className="absolute top-2 left-2 opacity-40" color={accent} size={28} />
        <div className="absolute top-2 right-2 opacity-40" style={{ transform: "scaleX(-1)" }}>
          <KazakhCorner color={accent} size={28} />
        </div>
        {children}
      </div>
    </div>
  );
}
