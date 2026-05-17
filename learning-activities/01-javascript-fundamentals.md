# Learning Activity 01 — JavaScript Fundamentals

> **Course:** BYU-I CSE 340 Web Backend Development — Week 1  
> **Outcome:** Write modern ES6+ JavaScript that is readable, concise, and suitable for a Node.js backend server.

---

## Why This Matters

Before you write a single line of Express, you need a firm footing in the language running underneath it all. Every route handler, every controller, every template helper — they are all JavaScript functions. Mastering these patterns now means you won't be fighting the language while learning the framework.

---

## 1. `const` and `let` — Never `var`

```js
// var leaks out of blocks — a source of endless bugs
for (var i = 0; i < 3; i++) {}
console.log(i) // 3 — oops, i escaped the loop

// let is block-scoped
for (let i = 0; i < 3; i++) {}
// console.log(i) // ReferenceError — correct behaviour

// const signals intent: "this binding will not be reassigned"
const port = process.env.PORT || 3000
const app  = express()

// const does NOT make objects immutable — properties can still change
const config = { port: 3000 }
config.port = 4000   // ✓ allowed
// config = {}       // ✗ TypeError — cannot reassign const
```

**Rule of thumb:** Default to `const`. Use `let` only when you know the variable will be reassigned. Never use `var`.

---

## 2. Arrow Functions

Arrow functions are the standard in modern backend code. They are always anonymous, always expressions, and they **do not have their own `this`** (which avoids common callback bugs).

```js
// Traditional function
function add(a, b) {
  return a + b
}

// Arrow function — same behaviour, less ceremony
const add = (a, b) => a + b

// Multi-line body requires curly braces and an explicit return
const formatTitle = (title) => {
  const trimmed = title.trim()
  return `${trimmed} | Tech Charities`
}

// Single parameter — parentheses optional
const double = n => n * 2

// No parameters — empty parens required
const getTimestamp = () => Date.now()
```

### Arrow Functions as Express Route Handlers

```js
// Every route handler in this course follows this pattern:
router.get('/categories', (req, res, next) => {
  res.render('categories', { title: 'Categories' })
})

// Or extracted to a controller for reusability:
const buildCategories = async (req, res, next) => {
  try {
    res.render('categories', { title: 'Categories' })
  } catch (err) {
    next(err)
  }
}
```

---

## 3. Template Literals

Template literals replace string concatenation and make multi-line strings readable.

```js
const name = 'Lebohang'
const port = 3000

// Old way — fragile concatenation
console.log('Hello, ' + name + '! Server on port ' + port)

// Template literal — readable and safe
console.log(`Hello, ${name}! Server on port ${port}`)

// Multi-line strings (useful for SQL queries in Week 2)
const query = `
  SELECT org_id, org_name, org_description
  FROM organizations
  WHERE category_id = $1
  ORDER BY org_name ASC
`

// Expression interpolation — any JS expression works
const isProduction = process.env.NODE_ENV === 'production'
console.log(`Mode: ${isProduction ? 'Production' : 'Development'}`)
```

---

## 4. Destructuring

Destructuring pulls values out of objects and arrays without repetitive property access.

```js
// Object destructuring — pulls named properties
const { name, description, image } = organization
// equivalent to:
// const name        = organization.name
// const description = organization.description
// const image       = organization.image

// With rename (useful when names conflict)
const { name: orgName, id: orgId } = organization

// Default values
const { port = 3000, host = 'localhost' } = config

// In function parameters — very common in Express callbacks
const buildHome = async ({ params, query, body }, res, next) => {
  // params, query, body are already destructured from req
}

// Array destructuring
const [first, second, ...rest] = categories
```

---

## 5. Spread and Rest Operators

Both use `...` but serve opposite purposes.

```js
// SPREAD: expand an iterable into individual elements

// Merge arrays
const envCategories  = ['Environmental']
const eduCategories  = ['Educational']
const allCategories  = [...envCategories, ...eduCategories, 'Health and Wellness']

// Merge objects (later keys win on conflict)
const defaults = { port: 3000, host: 'localhost', debug: false }
const override = { port: 4000 }
const config   = { ...defaults, ...override }
// { port: 4000, host: 'localhost', debug: false }

// Shallow-copy an object before mutating
const original = { title: 'Home', count: 5 }
const modified = { ...original, count: original.count + 1 }


// REST: collect remaining arguments into an array
const sum = (...numbers) => numbers.reduce((acc, n) => acc + n, 0)
sum(1, 2, 3, 4) // 10

// Rest in destructuring
const [head, ...tail] = [1, 2, 3, 4]
// head = 1, tail = [2, 3, 4]
```

---

## 6. Array Methods — `map`, `filter`, `reduce`

These three methods replace most `for` loops and are used everywhere in controller functions.

```js
const organizations = [
  { id: 1, name: 'Code for Change',    category: 'Educational', active: true  },
  { id: 2, name: 'Digital Equity Now', category: 'Educational', active: true  },
  { id: 3, name: 'Green Tech Alliance',category: 'Environmental', active: false },
  { id: 4, name: 'HealthTech Access',  category: 'Health',      active: true  },
]

// MAP — transform each item, returns same-length array
const names = organizations.map(org => org.name)
// ['Code for Change', 'Digital Equity Now', 'Green Tech Alliance', 'HealthTech Access']

// FILTER — keep items that pass a test, returns shorter-or-equal array
const active = organizations.filter(org => org.active)
// keeps 3 orgs (active === true)

// REDUCE — collapse array to a single value
const countByCategory = organizations.reduce((acc, org) => {
  acc[org.category] = (acc[org.category] || 0) + 1
  return acc
}, {})
// { Educational: 2, Environmental: 1, Health: 1 }

// Chained — filter THEN map
const activeNames = organizations
  .filter(org => org.active)
  .map(org => org.name)
// ['Code for Change', 'Digital Equity Now', 'HealthTech Access']
```

---

## 7. Promises and `async`/`await`

All database and file operations are **asynchronous** — they take time and must not block Node.js's single thread.

```js
// A Promise represents a future value: pending → fulfilled | rejected

// OLD STYLE — callback hell (avoid)
getOrganization(1, (err, org) => {
  if (err) { handleError(err); return }
  getProjects(org.id, (err, projects) => {
    // deeply nested — hard to read, hard to debug
  })
})

// PROMISE CHAIN — better, but still verbose
getOrganization(1)
  .then(org => getProjects(org.id))
  .then(projects => render(projects))
  .catch(err => handleError(err))

// ASYNC/AWAIT — required by this course, reads like synchronous code
const buildOrganizationDetail = async (req, res, next) => {
  try {
    const org      = await getOrganization(req.params.id)  // waits here
    const projects = await getProjects(org.id)              // then here
    res.render('organization-detail', { title: org.name, org, projects })
  } catch (err) {
    // Any awaited rejection lands here
    next(err)  // forward to Express error handler
  }
}
```

### The Golden Rule

Every `async` function **must** have a `try/catch` that calls `next(err)`. Without it, a thrown error silently hangs the request.

---

## 8. ES Modules (`import` / `export`)

This course uses ES Modules (ESM), the modern standard. Node.js enables ESM when `"type": "module"` is in `package.json`.

```js
// NAMED EXPORT — export multiple things from one file
// controllers/baseController.js
const buildHome       = async (req, res, next) => { /* ... */ }
const buildOrganizations = async (req, res, next) => { /* ... */ }
export { buildHome, buildOrganizations }

// NAMED IMPORT — import specific things by name
// routes/index.js
import { buildHome, buildOrganizations } from '../controllers/baseController.js'

// NAMESPACE IMPORT — import everything as an object
import * as baseCtrl from '../controllers/baseController.js'
baseCtrl.buildHome(req, res, next)

// DEFAULT EXPORT — one main thing per file
// routes/index.js
const router = Router()
export default router

// DEFAULT IMPORT — any name you choose
import indexRouter from './routes/index.js'
```

> **ESM rule:** Always include the `.js` extension in import paths. Node.js does not auto-append it in ESM mode.

---

## Practice Exercises

1. Write an arrow function `formatOrgCard(org)` that returns an object with `name` (uppercased) and `shortDescription` (first 100 chars of `org.description`).
2. Given an array of categories, use `.filter()` to get only active ones, then `.map()` to return just their names.
3. Create an `async` function that pretends to fetch data (`await new Promise(r => setTimeout(r, 100))`), wraps it in try/catch, and calls `next(err)` on failure.

---

## How This Connects to Week 2

In Week 2 you will write model functions that query a PostgreSQL database. Every one of them will be `async` functions that return Promises. The `await` keyword, destructuring, and array methods you practiced here will be your constant companions.

---

*Next: [02 — File and URL Paths](./02-file-url-paths.md)*
