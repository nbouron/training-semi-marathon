interface Props {
  size?: number;
}

export function Logo({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <circle cx="16" cy="16" r="16" fill="#2563eb" />
      <path d="M11 8h2v16h-2z" fill="#fff" />
      <path d="M13 9h8v3h-4v2h4v3h-8z" fill="#fff" />
    </svg>
  );
}
