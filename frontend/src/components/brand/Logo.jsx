const SIZES = {
  sm: { box: 'h-8 w-8', text: 'text-[10px]', radius: 'rounded-lg', showWordmark: false },
  md: { box: 'h-9 w-9', text: 'text-xs', radius: 'rounded-xl', showWordmark: true },
  lg: { box: 'h-11 w-11', text: 'text-sm', radius: 'rounded-xl', showWordmark: true },
}

function LogoMark({ className = '' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="48" height="48" rx="14" className="fill-sage" />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="20"
        fontWeight="700"
        letterSpacing="-0.04em"
        className="fill-paper"
      >
        JB
      </text>
      <circle cx="38" cy="38" r="3.5" className="fill-sand" />
    </svg>
  )
}

export default function Logo({
  size = 'md',
  showWordmark,
  wordmark = 'Job Tracker',
  className = '',
}) {
  const config = SIZES[size] ?? SIZES.md
  const displayWordmark = showWordmark ?? config.showWordmark

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`relative shrink-0 overflow-hidden ${config.box} ${config.radius}`}
      >
        <LogoMark className="h-full w-full" />
      </span>
      {displayWordmark ? (
        <span className="min-w-0 truncate font-semibold tracking-tight text-charcoal">
          {wordmark}
        </span>
      ) : null}
    </span>
  )
}

export { LogoMark }
