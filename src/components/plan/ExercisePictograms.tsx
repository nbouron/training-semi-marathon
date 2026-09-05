/** Minimal generic pictograms — one for dynamic movement, one for a static hold —
 * reused across exercises so every item has a visual cue without a full illustration library. */

export function DynamicPictogram() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" className="shrink-0 text-blue-600">
      <circle cx="16" cy="6" r="3" fill="currentColor" />
      <path
        d="M16 9 L16 17 M16 17 L9 24 M16 17 L24 12 M16 12 L8 9 M16 12 L23 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function StretchPictogram() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" className="shrink-0 text-purple-600">
      <circle cx="10" cy="6" r="3" fill="currentColor" />
      <path
        d="M10 9 L14 18 M14 18 L10 27 M14 18 L23 15 M23 15 L23 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
