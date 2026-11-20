// The to-do list's logic, kept free of the DOM so it can be tested with plain node.

let nextId = 1

// Longer titles break the layout; counted after trimming.
export const MAX_TITLE_LENGTH = 100

export function createList() {
  return []
}

export function addItem(list, title) {
  const text = String(title ?? "").trim()
  if (!text) throw new Error("A to-do needs a title")
  if ([...text].length > MAX_TITLE_LENGTH) throw new Error(`A to-do title can be at most ${MAX_TITLE_LENGTH} characters`)
  // Never below an id already in the list, so a list loaded from storage keeps its ids unique.
  const id = Math.max(nextId, ...list.map((item) => item.id + 1))
  nextId = id + 1
  return [...list, { id, title: text, done: false }]
}

export function toggleItem(list, id) {
  return list.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
}

export function removeItem(list, id) {
  return list.filter((item) => item.id !== id)
}

// How many items are still open, for the footer ("2 items left · 1 done").
export function remaining(list) {
  return list.filter((item) => !item.done).length
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
