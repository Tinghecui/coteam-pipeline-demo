import assert from "node:assert/strict"
import { test } from "node:test"
import { addItem, clearAll, clearDone, countOpen, createList, footerText, remaining, removeItem, renameItem, sortItems, toggleItem } from "../src/todo.js"

test("adding trims the title and refuses an empty one", () => {
  const list = addItem(createList(), "  buy milk  ")
  assert.equal(list[0].title, "buy milk")
  assert.throws(() => addItem(list, "   "), /needs a title/)
})

test("toggling marks one item done and back", () => {
  let list = addItem(addItem(createList(), "a"), "b")
  list = toggleItem(list, list[0].id)
  assert.deepEqual(list.map((i) => i.done), [true, false])
  assert.equal(remaining(list), 1)
  list = toggleItem(list, list[0].id)
  assert.equal(remaining(list), 2)
})

test("removing and clearing done items", () => {
  let list = addItem(addItem(createList(), "a"), "b")
  list = toggleItem(list, list[1].id)
  assert.equal(clearDone(list).length, 1)
  assert.equal(removeItem(list, list[0].id).length, 1)
})

test("footer says item for exactly one open to-do, items otherwise", () => {
  let list = createList()
  assert.equal(footerText(list), "0 items left")
  list = addItem(list, "a")
  assert.equal(footerText(list), "1 item left")
  list = addItem(list, "b")
  assert.equal(footerText(list), "2 items left")
  list = toggleItem(list, list[0].id)
  assert.equal(footerText(list), "1 item left · 1 done")
})

test("footer adds the done count after a middle dot, only when something is done", () => {
  let list = addItem(addItem(addItem(createList(), "a"), "b"), "c")
  assert.equal(footerText(list), "3 items left")
  list = toggleItem(list, list[0].id)
  assert.equal(footerText(list), "2 items left · 1 done")
  list = toggleItem(list, list[1].id)
  assert.equal(footerText(list), "1 item left · 2 done")
  list = toggleItem(list, list[2].id)
  assert.equal(footerText(list), "0 items left · 3 done")
})

test("sorting by added order, by title A–Z, or open ones first, without changing the list", () => {
  let list = addItem(addItem(addItem(createList(), "pears"), "Apples"), "bananas")
  list = toggleItem(list, list[1].id)
  const titles = (items) => items.map((i) => i.title)
  assert.deepEqual(titles(sortItems(list, "added")), ["pears", "Apples", "bananas"])
  assert.deepEqual(titles(sortItems(list, "title")), ["Apples", "bananas", "pears"])
  assert.deepEqual(titles(sortItems(list, "open-first")), ["pears", "bananas", "Apples"])
  assert.deepEqual(titles(sortItems(list, "nonsense")), ["pears", "Apples", "bananas"])
  assert.deepEqual(titles(list), ["pears", "Apples", "bananas"])
})

test("clearing all removes every item, done or not", () => {
  let list = addItem(addItem(createList(), "a"), "b")
  list = toggleItem(list, list[0].id)
  assert.deepEqual(clearAll(list), [])
  assert.deepEqual(clearAll(createList()), [])
})

test("adding refuses a title longer than 100 characters", () => {
  const list = addItem(createList(), "x".repeat(100))
  assert.equal(list[0].title.length, 100)
  assert.equal(addItem(list, `  ${"y".repeat(100)}  `)[1].title, "y".repeat(100))
  assert.throws(() => addItem(list, "x".repeat(101)), { message: "A to-do title can be at most 100 characters" })
})

test("an emoji counts as one character toward the title limit", () => {
  const list = addItem(createList(), "🍎".repeat(100))
  assert.equal(list[0].title, "🍎".repeat(100))
  assert.throws(() => addItem(list, "🍎".repeat(101)), { message: "A to-do title can be at most 100 characters" })
})

test("countOpen counts the to-dos not done yet", () => {
  assert.equal(countOpen(createList()), 0)
  let list = addItem(addItem(addItem(createList(), "a"), "b"), "c")
  assert.equal(countOpen(list), 3)
  list = toggleItem(list, list[1].id)
  assert.equal(countOpen(list), 2)
  list = toggleItem(toggleItem(list, list[0].id), list[2].id)
  assert.equal(countOpen(list), 0)
})

test("renaming gives one item a new, trimmed title and leaves the rest alone", () => {
  const list = addItem(addItem(createList(), "a"), "b")
  const renamed = renameItem(list, list[1].id, "  buy bread  ")
  assert.deepEqual(renamed.map((i) => i.title), ["a", "buy bread"])
  assert.equal(renamed[1].id, list[1].id)
  assert.equal(renamed[1].done, false)
  assert.deepEqual(list.map((i) => i.title), ["a", "b"])
})

test("renaming refuses an empty title or one longer than 100 characters", () => {
  const list = addItem(createList(), "a")
  assert.throws(() => renameItem(list, list[0].id, "   "), { message: "A to-do needs a title" })
  assert.throws(() => renameItem(list, list[0].id, "x".repeat(101)), { message: "A to-do title can be at most 100 characters" })
  assert.equal(renameItem(list, list[0].id, "x".repeat(100))[0].title, "x".repeat(100))
})

test("renaming an id that is not in the list returns the list unchanged", () => {
  const list = addItem(createList(), "a")
  assert.deepEqual(renameItem(list, list[0].id + 1000, "b"), list)
})
