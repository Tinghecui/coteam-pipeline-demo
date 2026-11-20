// Session helpers for the coming sign-in, kept free of the DOM so they can be tested with plain node.

// How long a new session lasts, in minutes.
export const DEFAULT_SESSION_MINUTES = 60

// Milliseconds until the session expires, or NaN when expiresAt is missing or unparsable.
function msLeft(session, now) {
  const expiresAt = Date.parse(session?.expiresAt ?? "")
  return expiresAt - now.getTime()
}

// A missing or unparsable expiresAt counts as expired.
export function isExpired(session, now) {
  const ms = msLeft(session, now)
  return Number.isNaN(ms) || ms <= 0
}

// Whole minutes left, rounded down, never below 0.
export function remainingMinutes(session, now) {
  if (isExpired(session, now)) return 0
  return Math.floor(msLeft(session, now) / 60000)
}
