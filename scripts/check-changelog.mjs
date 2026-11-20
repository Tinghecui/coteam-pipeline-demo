// Team rule: a pull request that changes the to-do logic (src/todo.js) adds a line to
// CHANGELOG.md under "Unreleased". Run by CI on pull requests.
import { execFileSync } from "node:child_process"

const base = process.env.BASE_SHA
if (!base) process.exit(0)
const files = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8" }).split("\n").filter(Boolean)
if (files.includes("src/todo.js") && !files.includes("CHANGELOG.md")) {
  console.error("src/todo.js changed but CHANGELOG.md did not: add a line under \"## Unreleased\" describing the change.")
  process.exit(1)
}
console.log("changelog ok")
