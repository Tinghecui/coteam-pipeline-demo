// Keeps the to-do list in the browser's storage (localStorage in the page, a fake in tests).
// A future change to the stored format uses a new key rather than migrating this one.

const KEY = "todo-list:v1"

export function saveList(list, store) {
  store.setItem(KEY, JSON.stringify(list))
}

// Anything missing, unreadable or not shaped like a list of to-dos loads as an empty list.
export function loadList(store) {
  let value
  try {
    value = JSON.parse(store.getItem(KEY))
  } catch {
    return []
  }
  return Array.isArray(value) && value.every(isItem) ? value : []
}

function isItem(item) {
  return (
    item !== null &&
    typeof item === "object" &&
    typeof item.id === "number" &&
    typeof item.title === "string" &&
    typeof item.done === "boolean"
  )
}
