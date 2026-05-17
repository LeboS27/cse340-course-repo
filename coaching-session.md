# Week 1 Coaching Session Guide

> **CSE 340 — Web Backend Development**  
> Use this guide during your coaching session or as a self-assessment before submitting your Week 1 assignment.

---

## What Is a Coaching Session?

A coaching session is a short (15–20 minute) conversation with your instructor or a teaching assistant where you walk through your working application and demonstrate understanding. It is **not** a test — it's a checkpoint to ensure you're building on solid foundations before the complexity increases in Week 2.

Prepare by running through every section of this guide before you meet.

---

## Part 1: Application Functionality Checklist

Run `npm start` (or `npm run dev`) and open `http://localhost:3000` in Chrome.

### Routes

- [ ] `GET /` — Home page loads with correct layout and styling
- [ ] `GET /organizations` — 4 organizations display with images
- [ ] `GET /projects` — Projects placeholder page renders
- [ ] `GET /categories` — All 4 categories display (Environmental, Educational, Community Service, Health and Wellness)
- [ ] `GET /notapage` — Custom 404 error page renders (not a blank screen)

### EJS Templates

- [ ] Page `<title>` changes on each page (visible in browser tab)
- [ ] Navigation is present and links work on all pages
- [ ] Header partial is shared across all pages
- [ ] Footer partial is shared across all pages and shows copyright
- [ ] Organizations page renders data from the controller array using a loop

### Static Assets

- [ ] CSS is applied (page is styled, not plain HTML)
- [ ] Organization images load (check Network tab — no 404s on image requests)
- [ ] No console errors in Chrome DevTools

---

## Part 2: Code Quality Self-Assessment

Open each file and verify:

### `server.js`
- [ ] `import 'dotenv/config'` is the first import
- [ ] `__dirname` is reconstructed using `fileURLToPath` and `dirname`
- [ ] Middleware is ordered: static → body parsers → routes → 404 → error handler
- [ ] Error handler has 4 parameters: `(err, req, res, next)`

### `routes/index.js`
- [ ] Uses `import`/`export` (ESM, not `require`)
- [ ] All 4 routes defined with arrow functions or controller references
- [ ] `export default router` at the bottom

### `controllers/baseController.js` and `controllers/categoriesController.js`
- [ ] All functions use `async (req, res, next) => {` pattern
- [ ] All functions have `try/catch` with `next(err)` in the catch
- [ ] `const` used everywhere, not `var`
- [ ] camelCase naming throughout

### EJS Views
- [ ] `<%= %>` used for data output (not `<%-` for user data)
- [ ] `<%- include('./partials/header', { title: title }) %>` used to include header
- [ ] `<%- include('./partials/footer') %>` used to include footer
- [ ] No raw JavaScript visible in the browser's View Source

### CSS
- [ ] Mobile view looks good at 375px (Chrome DevTools Device Toolbar)
- [ ] Desktop view looks good at 1280px
- [ ] Color contrast passes (text is readable on all backgrounds)

---

## Part 3: Debugging Strategies

### Browser DevTools

```
F12 → Console tab
  - Red errors = JavaScript crashed
  - Yellow warnings = non-fatal issues
  - Look for 404 errors on static assets

F12 → Network tab
  - Each row = one HTTP request
  - Green 200 = success
  - Red 404 = file not found (check path in HTML)
  - Red 500 = server error (check terminal for the error)

F12 → Elements tab
  - Inspect HTML structure
  - Check applied CSS rules on the right panel
  - Verify aria attributes are present
```

### Terminal (Node.js Server)

```bash
# Error messages appear here — not in the browser
# Look for the error TYPE and FILE:LINE number

# Common patterns:
SyntaxError: Cannot use import statement  → missing "type": "module" in package.json
Error: Cannot find module './routes/index.js'  → wrong import path or file doesn't exist
ENOENT: no such file or directory, 'views/home.ejs'  → wrong views path in server.js
ReferenceError: categories is not defined  → controller didn't pass categories to res.render()
```

### Common Week 1 Pitfalls

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Page loads but CSS missing | Wrong path in `<link href>` | Use `/css/styles.css` (absolute from root) |
| "Cannot GET /categories" | Route not defined | Add `router.get('/categories', ...)` in routes/index.js |
| `categories is not defined` in EJS | Not passed to render | Add `categories` to `res.render()` object |
| `__dirname is not defined` | Using ESM without reconstruction | Add the `fileURLToPath`/`dirname` pattern |
| Images show as broken | Wrong path or file missing | Check `public/images/` folder and `/images/filename.svg` path |
| Server won't start | Syntax error in JS | Read the terminal error — line number is usually shown |
| 500 on all pages | Error in server.js setup | Comment out routes one by one to isolate |

---

## Part 4: Testing with curl

These commands verify your routes respond with the correct status codes.

```bash
# Windows PowerShell
(Invoke-WebRequest http://localhost:3000/).StatusCode              # expect 200
(Invoke-WebRequest http://localhost:3000/organizations).StatusCode # expect 200
(Invoke-WebRequest http://localhost:3000/projects).StatusCode      # expect 200
(Invoke-WebRequest http://localhost:3000/categories).StatusCode    # expect 200

# Expect 404 — use -ErrorAction SilentlyContinue to suppress PowerShell error
try { (Invoke-WebRequest http://localhost:3000/notapage).StatusCode }
catch { $_.Exception.Response.StatusCode.value__ }                 # expect 404
```

```bash
# macOS/Linux (bash)
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/             # 200
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/organizations # 200
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/projects      # 200
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/categories    # 200
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/notapage      # 404
```

---

## Part 5: Questions to Expect From Your Instructor

Be ready to explain:

1. **"Walk me through what happens between `npm start` and the homepage appearing in the browser."**  
   Trace: `server.js` → Express config → middleware → route match → controller → EJS render → HTML response.

2. **"Why does `express.static()` come before your routes?"**  
   CSS/images are matched first. If routes ran first, a route like `router.get('/')` might accidentally intercept asset requests.

3. **"What's the difference between `<%= %>` and `<%- %>`?"**  
   `<%= %>` HTML-encodes output (XSS-safe). `<%- %>` outputs raw HTML (safe only for server-generated content or includes).

4. **"What happens if you remove `try/catch` from a controller?"**  
   A thrown error becomes an unhandled promise rejection, and Express never sees it. The request hangs until the client times out.

5. **"Show me the request/response cycle in Chrome DevTools."**  
   Open Network tab, reload `/categories`, click the top HTML request, show Request Headers and Response Headers.

---

## Part 6: Performance Quick-Check

```
Chrome DevTools → Lighthouse tab → Analyze page load (Mobile):
  Performance score > 70    ✓ acceptable
  Accessibility score > 90  ✓ required for this course
  Best Practices > 80       ✓ target

Network tab → reload with Ctrl+Shift+R (disable cache):
  HTML file < 50KB
  CSS file < 30KB
  Each SVG < 10KB
  Total page weight < 200KB
```

---

## Part 7: Deployed Site Verification

Before your coaching session, confirm your deployed Render.com site:

- [ ] Live URL is accessible in an incognito window (not just on your machine)
- [ ] All 4 pages work on the live URL
- [ ] CSS and images load on the live URL (check Network tab)
- [ ] `.env` is NOT visible in your GitHub repository
- [ ] `node_modules/` is NOT in your GitHub repository
- [ ] You have both URLs ready: GitHub repo URL + Render.com live URL

---

## Reflection Questions (Before Your Session)

Think through these — instructors may ask any of them:

- What part of this week's work took the most troubleshooting? What was the root cause?
- What does `next(err)` actually do? Where does the error go?
- If someone visits `/organizations` and the SVG images don't load, which file would you check first and why?
- How would you add a 5th page (`/about`) without changing `server.js`?
