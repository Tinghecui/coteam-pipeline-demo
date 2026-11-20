import assert from "node:assert/strict"
import { test } from "node:test"
import { addItem, clearDone, createList, remaining, removeItem, toggleItem } from "../src/todo.js"

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
