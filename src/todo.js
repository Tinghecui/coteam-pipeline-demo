// The to-do list's logic, kept free of the DOM so it can be tested with plain node.

let nextId = 1

export function createList() {
  return []
}

export function addItem(list, title) {
  const text = String(title ?? "").trim()
  if (!text) throw new Error("A to-do needs a title")
  return [...list, { id: nextId++, title: text, done: false }]
}

export function toggleItem(list, id) {
  return list.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
}

export function removeItem(list, id) {
  return list.filter((item) => item.id !== id)
}

// How many items are still open, for the footer ("2 items left").
export function remaining(list) {
  return list.filter((item) => !item.done).length
}

export function footerText(list) {
  const n = remaining(list)
  return `${n} items left`
}

export function clearDone(list) {
  return list.filter((item) => !item.done)
}
