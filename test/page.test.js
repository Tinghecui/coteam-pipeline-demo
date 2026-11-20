import assert from "node:assert/strict"
import { test } from "node:test"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

// Runs the page's inline script against a tiny fake DOM and a fake localStorage, so the
// page's wiring (load on start, save after each change) can be checked with plain node.

const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8")
const script = html
  .match(/<script type="module">([\s\S]*?)<\/script>/)[1]
  .replaceAll('"/src/', `"${new URL("../src/", import.meta.url).href}`)
const dir = mkdtempSync(join(tmpdir(), "page-test-"))
let runs = 0

function fakeElement() {
  return {
    children: [],
    value: "",
    textContent: "",
    replaceChildren(...children) {
      this.children = children
    },
    append(...children) {
      this.children.push(...children)
    },
  }
}

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

// Loads the page with the given store; returns its elements and helpers to use it.
// Timers are fake: they only fire when the test calls wait().
async function openPage(store) {
  const elements = {}
  let timers = []
  globalThis.setTimeout = (fn, ms) => {
    const timer = { fn, ms }
    timers.push(timer)
    return timer
  }
  globalThis.clearTimeout = (timer) => {
    timers = timers.filter((t) => t !== timer)
  }
  const el = (id) => (elements[id] ??= fakeElement())
  globalThis.document = {
    getElementById: el,
    createElement: () => fakeElement(),
  }
  globalThis.localStorage = store
  globalThis.alert = () => {}
  const file = join(dir, `page-${++runs}.mjs`)
  writeFileSync(file, script)
  await import(pathToFileURL(file).href)
  const rows = () => el("items").children
  return {
    titles: () => rows().map((li) => li.children[1].textContent),
    ticks: () => rows().map((li) => li.children[0].checked),
    add(title) {
      el("title").value = title
      el("new").onsubmit({ preventDefault() {} })
    },
    toggle: (i) => rows()[i].children[0].onchange(),
    remove: (i) => rows()[i].children[2].onclick(),
    clearDone: () => el("clear").onclick(),
    clearAll: () => el("clear-all").onclick?.(),
    undoShown: () => el("undo").hidden === false,
    undo: () => el("undo").onclick?.({ preventDefault() {} }),
    // Lets every pending timer of at most ms fire.
    wait(ms) {
      const due = timers.filter((t) => t.ms <= ms)
      timers = timers.filter((t) => t.ms > ms)
      due.forEach((t) => t.fn())
    },
  }
}

// What the page has saved so far; nothing saved reads as an empty list.
const stored = (store) => JSON.parse(store.data["todo-list:v1"] ?? "[]")

test("the page shows the stored list on start", async () => {
  const store = fakeStore({
    "todo-list:v1": JSON.stringify([
      { id: 1, title: "buy milk", done: true },
      { id: 7, title: "post letter", done: false },
    ]),
  })
  const page = await openPage(store)
  assert.deepEqual(page.titles(), ["buy milk", "post letter"])
})

test("the page starts empty when the stored list cannot be read", async () => {
  const page = await openPage(fakeStore({ "todo-list:v1": "{not json" }))
  assert.deepEqual(page.titles(), [])
})

test("the page saves after add, toggle, remove and clear done", async () => {
  const store = fakeStore()
  const page = await openPage(store)

  page.add("a")
  page.add("b")
  page.add("c")
  assert.deepEqual(stored(store).map((i) => i.title), ["a", "b", "c"])

  page.toggle(0)
  assert.deepEqual(stored(store).map((i) => i.done), [true, false, false])

  page.remove(2)
  assert.deepEqual(stored(store).map((i) => i.title), ["a", "b"])

  page.clearDone()
  assert.deepEqual(stored(store).map((i) => i.title), ["b"])
})

test("a refused empty title does not touch the stored list", async () => {
  const store = fakeStore()
  const page = await openPage(store)
  page.add("a")
  const before = store.data["todo-list:v1"]
  page.add("   ")
  assert.equal(store.data["todo-list:v1"], before)
})

test("what one page saved comes back in the next, ticks kept", async () => {
  const store = fakeStore()
  const first = await openPage(store)
  first.add("a")
  first.add("b")
  first.toggle(0)
  const second = await openPage(store)
  assert.deepEqual(second.titles(), ["a", "b"])
  assert.deepEqual(second.ticks(), [true, false])
})

test("clear all empties the list, done or not, and saves the empty list", async () => {
  const store = fakeStore()
  const page = await openPage(store)
  page.add("a")
  page.add("b")
  page.toggle(0)
  page.clearAll()
  assert.deepEqual(page.titles(), [])
  assert.deepEqual(stored(store), [])
  const again = await openPage(store)
  assert.deepEqual(again.titles(), [])
})

test("ticking a to-do shows Undo, which unticks it again and saves", async () => {
  const store = fakeStore()
  const page = await openPage(store)
  page.add("a")
  page.add("b")
  assert.equal(page.undoShown(), false)
  page.toggle(1)
  assert.equal(page.undoShown(), true)
  page.undo()
  assert.deepEqual(page.ticks(), [false, false])
  assert.deepEqual(stored(store).map((i) => i.done), [false, false])
  assert.equal(page.undoShown(), false)
})

test("Undo goes away after a few seconds", async () => {
  const page = await openPage(fakeStore())
  page.add("a")
  page.toggle(0)
  page.wait(5000)
  assert.equal(page.undoShown(), false)
  assert.deepEqual(page.ticks(), [true])
})

test("unticking does not offer Undo, and unticking by hand hides it", async () => {
  const page = await openPage(fakeStore())
  page.add("a")
  page.toggle(0)
  page.toggle(0)
  assert.equal(page.undoShown(), false)
  assert.deepEqual(page.ticks(), [false])
})

test("Undo is for the last ticked to-do and goes away when it is deleted", async () => {
  const page = await openPage(fakeStore())
  page.add("a")
  page.add("b")
  page.toggle(0)
  page.toggle(1)
  page.undo()
  assert.deepEqual(page.ticks(), [true, false])

  page.toggle(1)
  page.remove(1)
  assert.equal(page.undoShown(), false)
  page.undo()
  assert.deepEqual(page.ticks(), [true])
})
