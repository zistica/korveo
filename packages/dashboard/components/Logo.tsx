/** Korveo logo — the raven glyph. A raven watches everything and
 *  reports back: the product mark. Single-color head (adapts to the
 *  header via currentColor) + the brand-cyan "all-seeing" eye.
 *  Kept minimal so it stays legible down to favicon size.
 */
export default function Logo({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Korveo"
      role="img"
    >
      {/* head + beak (beak points left) */}
      <path
        d="M20.5 12c0 3.9-3.1 6.8-6.9 6.8-1.9 0-3.6-.7-4.9-1.9L2.8 13l5.4-1.1c.4-3.3 3.1-5.8 6.4-5.8 3.4 0 5.9 2.6 5.9 5.9z"
        fill="currentColor"
      />
      {/* crest feather */}
      <path d="M15.6 6.1 19.6 2.8 17.9 7.6z" fill="currentColor" />
      {/* all-seeing eye */}
      <circle cx="15.4" cy="11" r="1.6" fill="#22d3ee" />
    </svg>
  );
}
