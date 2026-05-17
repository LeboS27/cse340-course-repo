# Tech Charities — CSE 340 Week 1

A server-side rendered web application built with **Node.js**, **Express**, and **EJS** for BYU-I CSE 340 Web Backend Development.

The site showcases charitable technology organizations across four focus areas: Environmental, Educational, Community Service, and Health and Wellness.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env

# 3. Start the development server (hot reload)
npm run dev

# Open http://localhost:3000
```

---

## Project Structure

```
cse340-course-repo/
│
├── server.js                    # Entry point — Express config, middleware, error handlers
├── package.json                 # Dependencies and npm scripts
├── .env.example                 # Environment variable template (commit this)
├── .env                         # Your local secrets (gitignored — never commit)
│
├── routes/
│   └── index.js                 # All Week 1 route definitions
│
├── controllers/
│   ├── baseController.js        # Home, Organizations, Projects handlers
│   └── categoriesController.js  # Categories handler
│
├── views/
│   ├── partials/
│   │   ├── header.ejs           # <!DOCTYPE html> ... <main> (shared across all pages)
│   │   └── footer.ejs           # </main> ... </html> (shared across all pages)
│   ├── home.ejs                 # Landing page
│   ├── organizations.ejs        # Organization listing with images
│   ├── projects.ejs             # Projects placeholder (data added Week 2)
│   ├── categories.ejs           # Four category cards
│   └── errors/
│       └── error.ejs            # 404 and 500 error page
│
├── public/
│   ├── css/
│   │   └── styles.css           # Mobile-first stylesheet, CSS custom properties
│   └── images/
│       ├── code-for-change.svg
│       ├── digital-equity.svg
│       ├── green-tech.svg
│       └── healthtech-access.svg
│
├── learning-activities/         # Seven Week 1 learning guides
│   ├── 01-javascript-fundamentals.md
│   ├── 02-file-url-paths.md
│   ├── 03-server-side-fundamentals.md
│   ├── 04-nodejs-essentials.md
│   ├── 05-express-routing.md
│   ├── 06-ejs-templates.md
│   └── 07-deployment-pipeline.md
│
├── coaching-session.md          # Pre-session self-assessment and debugging guide
├── 60-second-status-update.md   # Weekly reflection prompts
└── deployment-guide.md          # Step-by-step Render.com deployment walkthrough
```

---

## Pages

| Route | Controller | View |
|-------|-----------|------|
| `GET /` | `baseController.buildHome` | `views/home.ejs` |
| `GET /organizations` | `baseController.buildOrganizations` | `views/organizations.ejs` |
| `GET /projects` | `baseController.buildProjects` | `views/projects.ejs` |
| `GET /categories` | `categoriesController.buildCategories` | `views/categories.ejs` |
| Any unmatched path | 404 middleware | `views/errors/error.ejs` |

---

## Architecture

```
Browser Request
      │
      ▼
server.js ── middleware stack (static files, body parsers)
      │
      ▼
routes/index.js ── matches URL to controller function
      │
      ▼
controllers/*.js ── gathers data, calls res.render()
      │
      ▼
views/*.ejs ── EJS merges data + template → HTML
      │
      ▼
Browser receives complete HTML response
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | ≥ 16.0.0 |
| Framework | Express | ^4.18.2 |
| Templates | EJS | ^3.1.9 |
| Environment | dotenv | ^16.3.1 |
| Dev server | nodemon | ^3.0.2 |
| Hosting | Render.com | — |
| CSS | Vanilla (mobile-first) | — |

---

## npm Scripts

```bash
npm start       # node server.js — production mode
npm run dev     # nodemon server.js — development mode with hot reload
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port (Render.com injects this automatically) |
| `NODE_ENV` | `development` | `production` on Render — controls error detail level |

Copy `.env.example` to `.env` and fill in values for local development. **Never commit `.env`.**

---

## Code Standards

Per the CSE 340 syllabus:

- `const` used wherever variable is not reassigned
- camelCase for all variable and function names
- Arrow function notation for all callback and handler functions
- `async`/`await` instead of `.then()`/`.catch()` chains
- ESM `import`/`export` syntax (no `require()`)
- `<%= %>` for EJS data output; `<%- %>` only for includes
- WCAG 2.1 AA accessibility: skip links, ARIA labels, 4.5:1 color contrast minimum

---

## Learning Activities

Work through these in order before attempting the assignment:

1. [JavaScript Fundamentals](./learning-activities/01-javascript-fundamentals.md) — ES6+ patterns used throughout
2. [File and URL Paths](./learning-activities/02-file-url-paths.md) — Absolute paths, path traversal security
3. [Server-side Fundamentals](./learning-activities/03-server-side-fundamentals.md) — HTTP cycle, status codes, headers
4. [Node.js Essentials](./learning-activities/04-nodejs-essentials.md) — Event loop, npm, environment variables
5. [Express.js and Routing](./learning-activities/05-express-routing.md) — Middleware, routes, controllers
6. [EJS Templates](./learning-activities/06-ejs-templates.md) — Tags, partials, XSS protection
7. [Deployment Pipeline](./learning-activities/07-deployment-pipeline.md) — Render.com, CI/CD, production config

---

## Deployment

See [deployment-guide.md](./deployment-guide.md) for the full Render.com walkthrough.

**Short version:**
1. Push to GitHub (verify `.env` is absent)
2. Create Web Service on Render.com
3. Set Build: `npm install`, Start: `npm start`
4. Add `NODE_ENV=production` in Render environment variables
5. Submit GitHub URL + Render URL to Canvas

---

## Week 2 Preview

This Week 1 codebase is designed to grow. In Week 2 you will:

- Install `pg` (PostgreSQL client) via npm
- Create a `utilities/` directory with a database connection module
- Write model functions that replace the hardcoded arrays in controllers
- Add a new `routes/inventoryRoute.js` mounted at `/inv`
- Query real data and render it with the same EJS patterns you built this week

The middleware order, controller pattern, and EJS templates you learned here are identical in Week 2 — only the data source changes.

---

## Author

Lebohang Sebata — BYU-I CSE 340 Web Backend Development
