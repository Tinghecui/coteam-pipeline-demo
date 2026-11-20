import assert from "node:assert/strict"
import { test } from "node:test"
import { loadList, saveList } from "../src/storage.js"
import { addItem, createList, toggleItem } from "../src/todo.js"

// Stands in for localStorage: only getItem/setItem, null for a missing key.
function fakeStore(initial = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value)
    },
  }
}

test("saving stores the list as JSON under todo-list:v1", () => {
  const store = fakeStore()
  const list = [{ id: 3, title: "buy milk", done: true }]
  saveList(list, store)
  assert.deepEqual(Object.keys(store.data), ["todo-list:v1"])
  assert.deepEqual(JSON.parse(store.data["todo-list:v1"]), list)
})

test("a saved list loads back the same, ticks kept", () => {
  const store = fakeStore()
  let list = addItem(addItem(createList(), "a"), "b")
  list = toggleItem(list, list[0].id)
  saveList(list, store)
  assert.deepEqual(loadList(store), list)
})

test("loading gives an empty list when nothing is stored", () => {
  assert.deepEqual(loadList(fakeStore()), [])
})

test("loading gives an empty list when the stored text is not JSON", () => {
  assert.deepEqual(loadList(fakeStore({ "todo-list:v1": "{not json" })), [])
})

test("loading gives an empty list when the stored value is not a list of items", () => {
  const bad = [
    { a: 1 },
    "a string",
    null,
    [{ id: "1", title: "a", done: false }],
    [{ id: 1, title: 2, done: false }],
    [{ id: 1, title: "a", done: "no" }],
    [{ id: 1, title: "a" }],
    [null],
    [{ id: 1, title: "a", done: false }, "b"],
  ]
  for (const value of bad) {
    assert.deepEqual(loadList(fakeStore({ "todo-list:v1": JSON.stringify(value) })), [], JSON.stringify(value))
  }
})

test("adding after loading never reuses a loaded id", () => {
  const store = fakeStore({
    "todo-list:v1": JSON.stringify([
      { id: 1, title: "a", done: false },
      { id: 7, title: "b", done: true },
    ]),
  })
  let list = loadList(store)
  for (let i = 0; i < 10; i++) list = addItem(list, `new ${i}`)
  assert.equal(list.length, 12)
  assert.equal(new Set(list.map((i) => i.id)).size, 12)
})
