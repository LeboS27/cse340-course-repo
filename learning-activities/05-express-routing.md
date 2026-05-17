# Learning Activity 05 — Express.js and Routing

> **Course:** BYU-I CSE 340 Web Backend Development — Week 1  
> **Outcome:** Configure an Express server, define routes using HTTP verbs, write middleware functions, and handle errors with the error-handling middleware pattern.

---

## What Is Express?

Express is a minimal, unopinionated Node.js web framework. "Minimal" means it only provides:

- A routing system (match URLs to handler functions)
- A middleware pipeline (run functions in sequence on every request)
- Thin wrappers around Node's `http` module

Everything else (database access, authentication, templating) you choose and add yourself. That's intentional — it teaches you what's actually happening rather than hiding it.

```js
import express from 'express'

const app = express()         // creates the application
app.listen(3000, () => {      // starts the HTTP server
  console.log('Server running at http://localhost:3000')
})
```

---

## 1. Middleware — The Heart of Express

**Middleware** is a function with signature `(req, res, next)` that runs on every request (or a subset) in the order it's registered.

```
Browser Request
      │
      ▼
express.static()          ← middleware 1: serve public/ files
      │ (calls next())
      ▼
express.urlencoded()      ← middleware 2: parse form bodies
      │ (calls next())
      ▼
express.json()            ← middleware 3: parse JSON bodies
      │ (calls next())
      ▼
router.get('/categories') ← middleware 4: route handler
      │ (res.render — sends response, no next() needed)
      ▼
(response sent to browser)
```

The key rule: **call `next()` to pass control to the next middleware, or send a response to end the chain.** If you do neither, the request hangs forever.

```js
// Custom logging middleware — logs every request
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()  // must call next() or requests hang
}

app.use(logger)           // applies to ALL routes
app.use('/admin', logger) // applies only to /admin/*
```

---

## 2. Application Setup — Middleware Order Matters

```js
import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import indexRouter from './routes/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const app        = express()
const port       = process.env.PORT || 3000

// 1. View engine — must be set before any res.render() calls
app.set('view engine', 'ejs')
app.set('views', join(__dirname, 'views'))

// 2. Static files — before routes so CSS/images are served without auth
app.use(express.static(join(__dirname, 'public')))

// 3. Body parsers — before any routes that read req.body
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// 4. Routes — after all general middleware
app.use('/', indexRouter)

// 5. 404 handler — after routes, catches unmatched paths
app.use((req, res, next) => {
  const err = new Error(`Page not found: ${req.path}`)
  err.status = 404
  next(err)
})

// 6. Error handler — must be LAST; Express knows it's an error handler
//    because it has 4 parameters (err, req, res, next)
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.render('errors/error', {
    title: 'Error',
    message: err.message,
    status: err.status || 500
  })
})
```

---

## 3. The Router — Modular Routes

`express.Router()` creates a mini-application with its own middleware and routes. Each router is mounted at a path in `server.js`.

```js
// routes/index.js
import { Router } from 'express'
import * as baseCtrl       from '../controllers/baseController.js'
import * as categoriesCtrl from '../controllers/categoriesController.js'

const router = Router()

router.get('/',             baseCtrl.buildHome)
router.get('/organizations', baseCtrl.buildOrganizations)
router.get('/projects',      baseCtrl.buildProjects)
router.get('/categories',    categoriesCtrl.buildCategories)

export default router

// server.js
import indexRouter from './routes/index.js'
app.use('/', indexRouter)  // mount at root — routes are '/', '/organizations', etc.
```

### Week 2 Pattern: Separate Router per Resource

```js
// routes/inventoryRoute.js
import { Router } from 'express'
import * as invCtrl from '../controllers/invController.js'

const router = Router()

router.get('/',           invCtrl.buildInventoryManagement)
router.get('/:id',        invCtrl.buildInventoryDetail)
router.post('/',          invCtrl.addInventoryItem)
router.put('/:id',        invCtrl.updateInventoryItem)
router.delete('/:id',     invCtrl.deleteInventoryItem)

export default router

// server.js
import inventoryRouter from './routes/inventoryRoute.js'
app.use('/inv', inventoryRouter)
// → GET /inv/        → buildInventoryManagement
// → GET /inv/42      → buildInventoryDetail with params.id = '42'
```

---

## 4. Route Handlers

Every route handler is middleware — it has `(req, res, next)`. The only difference is it typically sends a response instead of calling `next()`.

```js
// Inline handler (fine for simple routes)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// Controller function (preferred — keeps routes thin)
// controllers/baseController.js
const buildHome = async (req, res, next) => {
  try {
    // In Week 2, you'll await database calls here
    res.render('home', { title: 'Home' })
  } catch (err) {
    next(err)   // skip to error handler on failure
  }
}
export { buildHome }

// routes/index.js
import * as baseCtrl from '../controllers/baseController.js'
router.get('/', baseCtrl.buildHome)
```

### `req` — What the Browser Sent

```js
req.params        // route parameters: /orgs/:id → req.params.id
req.query         // query string: ?sort=name → req.query.sort
req.body          // POST body (requires body parser middleware)
req.headers       // request headers
req.method        // 'GET', 'POST', etc.
req.path          // '/categories'
req.hostname      // 'localhost'
req.ip            // client IP address
req.cookies       // cookies (requires cookie-parser package)
```

### `res` — What You Send Back

```js
res.render('home', { title: 'Home' })           // render EJS template
res.json({ id: 1, name: 'Code for Change' })    // send JSON
res.send('<h1>Hello</h1>')                       // send raw string/buffer
res.redirect('/login')                           // 302 redirect
res.redirect(301, '/new-url')                    // permanent redirect
res.status(404).render('errors/error', {...})    // set status then render
res.setHeader('X-Custom', 'value')               // set response header
res.sendFile(path.join(__dirname, 'file.pdf'))   // send a file
```

---

## 5. Error Handling — The `next(err)` Pattern

```js
// Every controller wraps in try/catch and passes errors to next()
const buildOrganizations = async (req, res, next) => {
  try {
    const orgs = await orgModel.getAll()   // may throw
    res.render('organizations', { title: 'Organizations', organizations: orgs })
  } catch (err) {
    next(err)   // jump to error handler
  }
}

// Error handler in server.js catches EVERYTHING passed to next(err)
app.use((err, req, res, next) => {
  const status = err.status || 500

  // Never reveal system details in production — attackers love stack traces
  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'Something went wrong. Please try again.'

  res.status(status).render('errors/error', { title: 'Error', message, status })
})
```

---

## 6. Route Parameter Validation (Preview)

```js
// Naive — crashes if :id is not a valid integer
router.get('/organizations/:id', async (req, res, next) => {
  const org = await orgModel.getById(req.params.id)  // SQL error if NaN
  res.render('org-detail', { org })
})

// Safer — validate before querying
router.get('/organizations/:id', async (req, res, next) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id) || id < 1) {
    const err = new Error('Invalid organization ID.')
    err.status = 400
    return next(err)
  }
  try {
    const org = await orgModel.getById(id)
    if (!org) {
      const err = new Error('Organization not found.')
      err.status = 404
      return next(err)
    }
    res.render('org-detail', { title: org.name, org })
  } catch (err) {
    next(err)
  }
})
```

---

## 7. Naming Conventions (Course Standard)

```
routes/
  index.js              ← central hub, imports all routers
  categoriesRoute.js    ← <resource>Route.js
  inventoryRoute.js

controllers/
  baseController.js           ← home, about, misc pages
  categoriesController.js     ← <resource>Controller.js
  invController.js

Function names:
  buildHome()            ← build + PascalCase page name
  buildOrganizations()
  buildCategories()
  addInventoryItem()     ← verb + Resource
  deleteInventoryItem()
```

---

## Practice Exercises

1. Add a `GET /about` route that renders a new `views/about.ejs` page. Follow the full pattern: route → controller function → EJS view.
2. Write a custom middleware that logs `req.method`, `req.path`, and the current timestamp for every request. Register it in `server.js` before your routes.
3. Visit `http://localhost:3000/notapage`. Trace exactly which middleware functions run before the 404 response is sent.

---

## How This Connects to Week 2

Week 2 mounts a new `inventoryRoute.js` router on `/inv`. All routes follow the patterns you set up here. The controller functions call model functions (database queries) instead of using hardcoded arrays, but `req`, `res`, `next`, and `try/catch` look identical.

---

*Next: [06 — EJS Templates](./06-ejs-templates.md)*
