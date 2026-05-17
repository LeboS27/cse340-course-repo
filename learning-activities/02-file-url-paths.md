# Learning Activity 02 — File and URL Paths

> **Course:** BYU-I CSE 340 Web Backend Development — Week 1  
> **Outcome:** Distinguish absolute from relative paths, explain URL structure, and prevent path traversal vulnerabilities.

---

## Why This Matters

When your server tries to send a file — a CSS stylesheet, an image, an EJS template — it must know **exactly** where that file lives on disk. Get the path wrong and you get a cryptic `ENOENT: no such file or directory` error. Get it very wrong and you open a security hole that lets attackers read files outside your web root.

---

## 1. Filesystem Paths

### Absolute vs. Relative

```
Absolute: starts from the root of the filesystem
  Windows:  C:\Users\TechCharities\Documents\cse340\server.js
  macOS/Linux: /home/lebohang/cse340/server.js

Relative: starts from the current working directory (where you ran node)
  ./server.js          — same directory
  ../views/home.ejs    — one level up, then into views/
  ../../public/css/    — two levels up
```

```js
// PROBLEM: relative paths break when you run node from a different directory
const viewPath = './views/home.ejs'    // works from project root
// cd public && node ../server.js      // now './views' resolves to public/views/ — broken!

// SOLUTION: build paths from __dirname (the directory of the current file)
// In ESM (which this course uses), reconstruct it:
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)  // full path to this file
const __dirname  = dirname(__filename)              // directory containing this file

// join() safely concatenates path segments, handling OS separators automatically
const viewsDir = join(__dirname, 'views')
// → C:\Users\TechCharities\Documents\cse340\views  (Windows)
// → /home/lebohang/cse340/views                    (macOS/Linux)
```

### The `path` Module

```js
import path from 'path'

path.join('/foo', 'bar', 'baz.js')   // /foo/bar/baz.js
path.resolve('foo', 'bar')           // absolute path from CWD + foo/bar
path.basename('/foo/bar/styles.css') // 'styles.css'
path.dirname('/foo/bar/styles.css')  // '/foo/bar'
path.extname('styles.css')           // '.css'

// join vs resolve
path.join('/a', '../b')              // /b   (joins then normalizes)
path.resolve('/a', '../b')           // /b   (same for absolute)
path.resolve('a', 'b')              // /cwd/a/b  (resolves relative to CWD)
```

---

## 2. URL Structure

Every HTTP request targets a URL. Understanding each part helps you write correct routes.

```
https://techcharities.onrender.com:443/categories?sort=name&limit=10#top
│       │                          │   │          │                  │
│       │                          │   │          query string       fragment (client-only)
│       │                          │   path
│       │                          port (443 = default HTTPS, omitted normally)
│       hostname
scheme/protocol
```

In Express, you work with:

```js
// Given URL: GET /organizations?category=environmental&sort=name
router.get('/organizations', (req, res) => {
  console.log(req.path)           // '/organizations'
  console.log(req.query.category) // 'environmental'
  console.log(req.query.sort)     // 'name'
  console.log(req.method)         // 'GET'
  console.log(req.hostname)       // 'localhost' or 'techcharities.onrender.com'
})
```

### Route Parameters vs. Query Strings

```js
// Route parameter — part of the path, required
router.get('/organizations/:id', (req, res) => {
  console.log(req.params.id)   // '42' (always a string — parse if numeric)
})
// URL: /organizations/42

// Query string — appended with ?, optional
router.get('/organizations', (req, res) => {
  const { category, sort = 'name', limit = '20' } = req.query
})
// URL: /organizations?category=educational&sort=name
```

---

## 3. HTTP Methods (Verbs)

REST uses different HTTP verbs to signal **intent**:

| Verb     | Typical use            | Express method         |
|----------|------------------------|------------------------|
| `GET`    | Read / retrieve data   | `router.get()`         |
| `POST`   | Create a new resource  | `router.post()`        |
| `PUT`    | Replace a resource     | `router.put()`         |
| `PATCH`  | Partially update       | `router.patch()`       |
| `DELETE` | Remove a resource      | `router.delete()`      |

```js
// Week 1 uses only GET
router.get('/', baseCtrl.buildHome)

// Week 3+ will add POST for form submissions
router.post('/organizations', orgCtrl.createOrganization)
```

---

## 4. Static Files vs. Dynamic Routes

```
Request: GET /css/styles.css
         ↓
Express middleware stack
         ↓
express.static('public')  ← Checks: does public/css/styles.css exist on disk?
   YES → Sends the file. Request ends here. Route handlers never run.
   NO  → Calls next(), continues to route handlers.

Request: GET /categories
         ↓
express.static  ← No file at public/categories. Calls next().
         ↓
router.get('/categories', ...)  ← Matches. Controller runs. EJS template renders.
```

This is why `app.use(express.static(...))` must come **before** your route definitions in `server.js`.

---

## 5. Path Traversal Security

Path traversal is a vulnerability where an attacker manipulates a path to escape your web root and read arbitrary files.

```
Attacker sends: GET /files?name=../../.env
Your insecure code: res.sendFile(path.join(__dirname, 'uploads', req.query.name))
Result: Serves your .env file (database passwords, API keys)!
```

**Prevention:**

```js
import path from 'path'

const safeSendFile = (req, res, next) => {
  const uploadDir = path.join(__dirname, 'uploads')
  // Resolve the full path, then verify it still starts with uploadDir
  const requestedPath = path.resolve(uploadDir, req.query.name)

  if (!requestedPath.startsWith(uploadDir)) {
    // Path escaped the upload directory — reject it
    return res.status(400).json({ error: 'Invalid file path.' })
  }
  res.sendFile(requestedPath)
}
```

In this course, `express.static()` handles file serving safely for you. The lesson: **never** build file paths from user input without sanitizing.

---

## 6. `public/` Directory Structure

```
public/
├── css/
│   └── styles.css          → served as /css/styles.css
├── images/
│   ├── code-for-change.svg → served as /images/code-for-change.svg
│   └── ...
└── js/
    └── (future client-side scripts)
```

In your EJS templates, reference assets from the web root:

```html
<!-- Correct — absolute from web root -->
<link rel="stylesheet" href="/css/styles.css">
<img src="/images/code-for-change.svg" alt="...">

<!-- Wrong — relative to current page URL (breaks on nested routes) -->
<link rel="stylesheet" href="css/styles.css">
```

---

## Practice Exercises

1. Open `server.js` and trace exactly what `join(__dirname, 'views')` produces on your machine. Print it with `console.log()` and verify it.
2. Visit `http://localhost:3000/categories?sort=name` and add a `console.log(req.query)` inside the controller. What do you see in the terminal?
3. What would happen if you put `app.use('/', indexRouter)` **before** `app.use(express.static(...))` in `server.js`? Try it and observe.

---

## How This Connects to Week 2

Week 2 introduces a `/organizations/:id` route. The `req.params.id` value you learned about here will be the key you pass to a database query function. Understanding how parameters arrive lets you write model functions that accept the right data type.

---

*Next: [03 — Server-side Fundamentals](./03-server-side-fundamentals.md)*
