// Static file server for local use: `npm start`, then open http://localhost:3000
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { extname, join, normalize } from "node:path"

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" }
const root = new URL(".", import.meta.url).pathname

createServer(async (req, res) => {
  const path = normalize(new URL(req.url, "http://x").pathname)
  const file = path === "/" ? "public/index.html" : path.startsWith("/src/") ? path.slice(1) : join("public", path)
  try {
    const body = await readFile(join(root, file))
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" }).end(body)
  } catch {
    res.writeHead(404).end("not found")
  }
}).listen(process.env.PORT || 3000)
