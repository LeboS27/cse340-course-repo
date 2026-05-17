# Learning Activity 04 — Node.js Essentials

> **Course:** BYU-I CSE 340 Web Backend Development — Week 1  
> **Outcome:** Explain how Node.js works, use npm to manage packages, and understand why event-driven, non-blocking I/O makes Node.js suited for web servers.

---

## What Is Node.js?

Node.js is a **JavaScript runtime** built on Chrome's V8 engine. Before Node.js, JavaScript only ran inside browsers. Node.js brought JavaScript to the server — allowing one language across the full stack.

```
Browser JavaScript                  Node.js JavaScript
─────────────────────               ─────────────────────
Runs in Chrome/Firefox/Safari       Runs on your computer / server
Has window, document, DOM           Has process, fs, http, os, path
Can't read files                    Can read/write files, network sockets
Sandboxed — no OS access            Full OS access (with caution)
```

---

## 1. The Event Loop — Why Node.js is Fast

Node.js uses a **single thread** + an **event loop**. This sounds like a limitation, but it's a superpower for I/O-heavy work like web servers.

```
Traditional multi-threaded server (PHP, Java):
  Request 1 → Thread 1 → runs query → WAITS for DB (thread blocked)
  Request 2 → Thread 2 → runs query → WAITS for DB (thread blocked)
  1,000 requests = 1,000 threads = huge memory cost

Node.js (single-threaded, non-blocking):
  Request 1 → starts DB query → registers callback → moves on
  Request 2 → starts DB query → registers callback → moves on
  Request 3 → starts DB query → registers callback → moves on
  DB responds for Request 1 → event loop picks up callback → responds
  (All three queries ran "simultaneously" with one thread!)
```

This works because **I/O operations** (disk reads, network calls, database queries) spend most of their time waiting — not computing. Node.js delegates that waiting to the OS and processes other requests in the meantime.

```js
// This would BLOCK the event loop — never do this in production
const data = fs.readFileSync('bigfile.txt')    // freezes the server

// This is NON-BLOCKING — file is read in the background
fs.readFile('bigfile.txt', 'utf8', (err, data) => {
  if (err) throw err
  console.log(data)
})
// continues here immediately while file read happens in background

// Modern async/await version (what this course uses)
const data = await fs.promises.readFile('bigfile.txt', 'utf8')
```

---

## 2. CommonJS vs. ES Modules

Node.js originally used **CommonJS** (`require`/`module.exports`). Modern Node.js supports **ES Modules** (`import`/`export`). This course uses ESM.

```js
// ── CommonJS (legacy — you'll see this in tutorials/StackOverflow) ──

// Export
module.exports = { buildHome, buildOrganizations }
// or
module.exports.buildHome = buildHome

// Import
const { buildHome } = require('./controllers/baseController')
const express        = require('express')

// ── ES Modules (ESM — what this course uses) ──

// Export
export { buildHome, buildOrganizations }       // named exports
export default router                          // default export

// Import
import { buildHome } from './controllers/baseController.js'
import express from 'express'
import * as ctrl from './controllers/baseController.js'
```

**Enable ESM** in `package.json`:
```json
{
  "type": "module"
}
```

> If you see tutorials using `require()`, mentally translate to `import`. The logic is identical; only the syntax differs.

---

## 3. npm and `package.json`

**npm** (Node Package Manager) manages third-party libraries your project depends on.

```bash
# Initialize a new project (creates package.json)
npm init -y

# Install a production dependency (added to "dependencies")
npm install express

# Install a dev-only dependency (only needed during development)
npm install --save-dev nodemon

# Install all dependencies listed in package.json
npm install

# Run a script from package.json
npm start
npm run dev
```

### Anatomy of `package.json`

```json
{
  "name": "cse340-tech-charities",
  "version": "1.0.0",
  "type": "module",          ← enables ESM (import/export)
  "main": "server.js",       ← entry point
  "scripts": {
    "start": "node server.js",          ← npm start (production)
    "dev":   "nodemon server.js"        ← npm run dev (development, hot reload)
  },
  "engines": {
    "node": ">=16.0.0"       ← minimum Node.js version required
  },
  "dependencies": {
    "dotenv":  "^16.3.1",    ← ^ means: compatible minor/patch updates OK
    "ejs":     "^3.1.9",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"      ← only installed locally, NOT on Render.com
  }
}
```

### `node_modules/` and `.gitignore`

```
node_modules/ contains thousands of files — NEVER commit it to git.
package.json records WHAT you need.
npm install recreates node_modules/ from package.json automatically.

Your .gitignore already includes:
  node_modules/
```

When Render.com deploys your app, it runs `npm install` using your `package.json`. `devDependencies` are skipped in production, saving deploy time.

---

## 4. Environment Variables and `dotenv`

Environment variables store configuration that changes between environments (development laptop vs. production server) or that must stay secret (passwords, API keys).

```bash
# .env (never commit — gitignored)
PORT=3000
NODE_ENV=development
DB_URL=postgresql://user:secret@localhost/techcharities
```

```js
// Load .env values into process.env
import 'dotenv/config'    // must be the FIRST import in server.js

// Now use anywhere in the app:
const port = process.env.PORT        // '3000' (always a string)
const isDev = process.env.NODE_ENV === 'development'
```

**On Render.com:** You add environment variables in the dashboard under "Environment". The app reads them from `process.env` exactly the same way. Never store secrets in code.

---

## 5. The `fs` Module (File System)

Node.js can read and write files directly — the browser cannot.

```js
import fs from 'fs'
import { promises as fsp } from 'fs'

// Synchronous (blocks event loop — avoid in production)
const content = fs.readFileSync('./data.json', 'utf8')

// Callback-based async
fs.readFile('./data.json', 'utf8', (err, content) => {
  if (err) console.error(err)
  else console.log(JSON.parse(content))
})

// Promise-based async (preferred in modern Node.js)
const content = await fsp.readFile('./data.json', 'utf8')
const data    = JSON.parse(content)
await fsp.writeFile('./output.json', JSON.stringify(data, null, 2))
```

---

## 6. Built-in Node.js Modules

```js
import path    from 'path'    // file path utilities (join, resolve, extname)
import fs      from 'fs'      // file system (read, write, delete files)
import url     from 'url'     // URL parsing and fileURLToPath
import os      from 'os'      // operating system info (hostname, platform, cpus)
import crypto  from 'crypto'  // cryptographic utilities (hashing passwords — Week 5)
import http    from 'http'    // raw HTTP server (Express wraps this)
import events  from 'events'  // EventEmitter base class
```

You don't `npm install` built-ins — they come with Node.js. You also don't need all of them in Week 1; knowing they exist matters more right now.

---

## 7. nodemon — Hot Reload for Development

Without nodemon, you must manually stop (`Ctrl+C`) and restart Node.js after every code change.

```bash
# nodemon watches your files and restarts automatically on save
npm run dev     # runs: nodemon server.js

# You'll see:
# [nodemon] starting `node server.js`
# Server running at http://localhost:3000
# [nodemon] restarting due to changes...
# [nodemon] starting `node server.js`
# Server running at http://localhost:3000
```

**Important:** nodemon is a `devDependency`. Render.com runs `npm start` (`node server.js`) — not nodemon. Never use `npm run dev` as your production start command.

---

## Practice Exercises

1. Run `node --version` in your terminal. What version is installed? Does it meet the `>=16.0.0` requirement?
2. Add `console.log(process.env)` to `server.js`, run `npm start`, and observe what variables Node.js has access to. Then add a `PORT=4000` line to `.env` and notice what changes.
3. Create a throwaway `scratch.js` file. Use `import { promises as fsp } from 'fs'` to write a JSON file, then read it back and log its contents. Run with `node scratch.js`.

---

## How This Connects to Week 2

In Week 2 you will install `pg` (the PostgreSQL client for Node.js) via npm. It uses the same event-driven, callback/Promise pattern you saw with `fs.readFile`. The async/await syntax keeps the code clean regardless of whether you're reading files or querying databases.

---

*Next: [05 — Express.js and Routing](./05-express-routing.md)*
