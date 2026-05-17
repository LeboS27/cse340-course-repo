/* ***********************
 * server.js — Application Entry Point
 *
 * Responsibilities:
 *   1. Load environment variables from .env
 *   2. Configure Express (view engine, middleware)
 *   3. Attach routers
 *   4. Define 404 and global error handlers
 *   5. Start the HTTP server
 *
 * Request lifecycle:
 *   Browser → server.js middleware stack → routes/index.js
 *   → controller function → EJS view → HTML response → browser
 * *********************** */
import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import indexRouter from './routes/index.js'

// ESM does not expose __dirname — reconstruct it from the module URL
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

/* ***********************
 * View Engine
 * EJS reads .ejs files from /views, replaces <%= tags %>, and returns HTML.
 * *********************** */
app.set('view engine', 'ejs')
app.set('views', join(__dirname, 'views'))

/* ***********************
 * Middleware Stack
 * Middleware runs in the ORDER it is registered — this matters.
 * Each function receives (req, res, next) and either responds or calls next().
 * *********************** */

// Static assets: /public/css, /public/images, /public/fonts, etc.
// Matched BEFORE routes so assets are never blocked by route handlers.
app.use(express.static(join(__dirname, 'public')))

// Parse URL-encoded form bodies (HTML <form> POST submissions — used in Week 3+)
app.use(express.urlencoded({ extended: true }))

// Parse JSON request bodies (fetch/Ajax POST — used in Week 4+)
app.use(express.json())

/* ***********************
 * Routes
 * *********************** */
app.use('/', indexRouter)

/* ***********************
 * 404 — Page Not Found
 * Runs only when NO route above matched. Creates an error and passes it
 * to the error handler below via next(err).
 * *********************** */
app.use((req, res, next) => {
  const err = new Error(`The page at "${req.path}" could not be found.`)
  err.status = 404
  next(err)
})

/* ***********************
 * Global Error Handler
 * Express identifies a 4-parameter middleware as an error handler.
 * Receives errors from anywhere in the app via next(err).
 * Never reveal stack traces in production — they expose server internals.
 * *********************** */
app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status)
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred. Please try again later.'
  res.render('errors/error', { title: 'Error', message, status })
})

/* ***********************
 * Start Server
 * *********************** */
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌  Port ${port} is already in use.`)
    console.error(`    Kill the process holding it, then restart:\n`)
    console.error(`    Git Bash:   PID=$(netstat -ano | grep LISTENING | grep ':${port}' | awk '{print $NF}'); taskkill //PID $PID //F`)
    console.error(`    PowerShell: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${port}).OwningProcess -Force\n`)
    process.exit(1)
  } else {
    throw err
  }
})

// Graceful shutdown — Render.com and Docker send SIGTERM before stopping a container
process.on('SIGTERM', () => {
  server.close(() => process.exit(0))
})
