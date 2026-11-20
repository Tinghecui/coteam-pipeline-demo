import assert from "node:assert/strict"
import { test } from "node:test"
import { isExpired, remainingMinutes } from "../src/auth/session.js"

const session = { expiresAt: "2026-01-01T12:00:00.000Z" }

test("a session is expired at or after expiresAt, not before", () => {
  assert.equal(isExpired(session, new Date("2026-01-01T11:59:59.999Z")), false)
  assert.equal(isExpired(session, new Date("2026-01-01T12:00:00.000Z")), true)
  assert.equal(isExpired(session, new Date("2026-01-01T12:00:00.001Z")), true)
})

test("a missing or unparsable expiresAt counts as expired", () => {
  const now = new Date("2026-01-01T00:00:00.000Z")
  assert.equal(isExpired({}, now), true)
  assert.equal(isExpired({ expiresAt: "" }, now), true)
  assert.equal(isExpired({ expiresAt: "not a date" }, now), true)
  assert.equal(isExpired(null, now), true)
  assert.equal(isExpired(undefined, now), true)
})

test("remaining minutes are whole minutes, rounded down", () => {
  assert.equal(remainingMinutes(session, new Date("2026-01-01T11:45:00.000Z")), 15)
  assert.equal(remainingMinutes(session, new Date("2026-01-01T11:44:00.001Z")), 15)
  assert.equal(remainingMinutes(session, new Date("2026-01-01T11:59:00.001Z")), 0)
})

test("remaining minutes never go below 0", () => {
  assert.equal(remainingMinutes(session, new Date("2026-01-01T12:00:00.000Z")), 0)
  assert.equal(remainingMinutes(session, new Date("2026-01-01T13:30:00.000Z")), 0)
  assert.equal(remainingMinutes({}, new Date("2026-01-01T11:00:00.000Z")), 0)
  assert.equal(remainingMinutes({ expiresAt: "not a date" }, new Date("2026-01-01T11:00:00.000Z")), 0)
})
