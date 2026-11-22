// The to-do list's logic, kept free of the DOM so it can be tested with plain node.

let nextId = 1

// Longer titles break the layout; counted after trimming.
export const MAX_TITLE_LENGTH = 100

export function createList() {
  return []
}

// Whether the list has no to-dos at all, done or not.
export function isEmpty(list) {
  return list.length === 0
}

// The same rules for a new title and a renamed one: trimmed, not empty, not too long.
function cleanTitle(title) {
  const text = String(title ?? "").trim()
  if (!text) throw new Error("A to-do needs a title")
  if ([...text].length > MAX_TITLE_LENGTH) throw new Error(`A to-do title can be at most ${MAX_TITLE_LENGTH} characters`)
  return text
}

export function addItem(list, title) {
  const text = cleanTitle(title)
  // Never below an id already in the list, so a list loaded from storage keeps its ids unique.
  const id = Math.max(nextId, ...list.map((item) => item.id + 1))
  nextId = id + 1
  return [...list, { id, title: text, done: false }]
}

export function toggleItem(list, id) {
  return list.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
}

// An id not in the list leaves it unchanged; the title is still checked, as addItem checks it.
export function renameItem(list, id, title) {
  const text = cleanTitle(title)
  return list.map((item) => (item.id === id ? { ...item, title: text } : item))
}

export function removeItem(list, id) {
  return list.filter((item) => item.id !== id)
}

// How many items are still open, for the footer ("2 items left · 1 done").
export function remaining(list) {
  return list.filter((item) => !item.done).length
}

// The titles of all to-dos, done or not, in the list's order.
export function titles(list) {
  return list.map((item) => item.title)
}

// The first to-do whose title is exactly this one (case and spaces count), or null when there is none.
export function findByTitle(list, title) {
  return list.find((item) => item.title === title) ?? null
}

// How many to-dos there are in all, done or not.
export function count(list) {
  return list.length
}

// How many to-dos are not done yet; the same count as remaining(), so the two cannot drift apart.
export function countOpen(list) {
  return remaining(list)
}

// How many to-dos are done; together with countOpen() it adds up to the whole list.
export function countDone(list) {
  return list.length - remaining(list)
}

// Whether at least one to-do is not done yet; an empty list has none.
export function hasOpenItems(list) {
  return remaining(list) > 0
}

export function footerText(list) {
  const n = remaining(list)
  const left = `${n} ${n === 1 ? "item" : "items"} left`
  const done = list.length - n
  return done > 0 ? `${left} · ${done} done` : left
}

export function clearDone(list) {
  return list.filter((item) => !item.done)
}

// Empties the whole list, done or not; asks nothing, as the page's "Clear all" button does.
export function clearAll(list) {
  return []
}

// The order the list is shown in; the list itself always stays in the order things were added.
// "added" (oldest first), "title" (A–Z, ignoring case) or "open-first" (open ones, then done ones).
export function sortItems(list, order) {
  const items = [...list]
  if (order === "title") return items.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }) || a.id - b.id)
  if (order === "open-first") return items.sort((a, b) => a.done - b.done || a.id - b.id)
  return items.sort((a, b) => a.id - b.id)
}
