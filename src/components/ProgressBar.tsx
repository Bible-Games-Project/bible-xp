interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  tone?: "green" | "yellow" | "blue" | "violet";
  size?: "sm" | "md";
}

export function ProgressBar({ value, max, label, tone = "green", size = "md" }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={`progress progress--${tone} progress--${size}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="progress__fill" style={{ width: `${pct}%` }}>
        {pct > 0 && <span className="progress__shine" />}
      </div>
    </div>
  );
}
