# Learning Activity 03 — Server-side Fundamentals

> **Course:** BYU-I CSE 340 Web Backend Development — Week 1  
> **Outcome:** Explain the HTTP request/response cycle, read status codes and headers, and describe where server-side rendering fits in the web stack.

---

## The Big Picture: How the Web Actually Works

```
┌─────────────────┐    HTTP Request     ┌──────────────────────┐
│                 │ ──────────────────► │                      │
│  Browser        │                     │  Your Node.js Server │
│  (Chrome, etc.) │ ◄────────────────── │  (Express + EJS)     │
│                 │    HTTP Response     │                      │
└─────────────────┘                     └──────────────────────┘
```

Every interaction on the web is a **request** from the browser and a **response** from the server. Your Express app controls what the response looks like.

---

## 1. The Request/Response Cycle — Step by Step

```
1. User types https://techcharities.onrender.com/categories in Chrome.

2. Browser performs DNS lookup:
   techcharities.onrender.com → 104.21.x.x

3. Browser opens a TCP connection to port 443 (HTTPS).

4. Browser sends an HTTP request:
   ┌────────────────────────────────────────────────┐
   │ GET /categories HTTP/1.1                       │
   │ Host: techcharities.onrender.com               │
   │ Accept: text/html,application/xhtml+xml        │
   │ Accept-Language: en-US,en;q=0.9                │
   │ Connection: keep-alive                         │
   └────────────────────────────────────────────────┘

5. Your Express server receives the request, matches route /categories,
   runs categoriesController.buildCategories(), renders categories.ejs.

6. Server sends an HTTP response:
   ┌────────────────────────────────────────────────┐
   │ HTTP/1.1 200 OK                                │
   │ Content-Type: text/html; charset=utf-8         │
   │ Content-Length: 4821                           │
   │                                                │
   │ <!DOCTYPE html>                                │
   │ <html lang="en"> ...                           │
   └────────────────────────────────────────────────┘

7. Browser renders the HTML, sees <link rel="stylesheet" href="/css/styles.css">,
   makes a SECOND request: GET /css/styles.css

8. Express static middleware finds public/css/styles.css, responds 200 with the file.

9. Browser applies the CSS and displays the styled page.
```

A single page load often triggers 10–30 separate HTTP requests (HTML + CSS + JS + images + fonts).

---

## 2. HTTP Status Codes

Status codes tell the browser what happened. Know these cold.

| Code | Name                  | When Express uses it                                  |
|------|-----------------------|-------------------------------------------------------|
| 200  | OK                    | `res.render()`, `res.json()`, `res.send()`            |
| 201  | Created               | `res.status(201).json(newOrg)` after POST             |
| 301  | Moved Permanently     | `res.redirect(301, '/new-url')`                       |
| 302  | Found (temporary)     | `res.redirect('/login')` — default redirect           |
| 400  | Bad Request           | Invalid data sent by the client                       |
| 401  | Unauthorized          | Not logged in (Week 5 authentication)                 |
| 403  | Forbidden             | Logged in but lacks permission                        |
| 404  | Not Found             | No route matched (your 404 handler)                   |
| 500  | Internal Server Error | Unhandled exception in your code                      |

```js
// Express sets 200 automatically for res.render() and res.send()
res.render('home', { title: 'Home' })       // implicit 200

// Set status explicitly before render/send
res.status(404).render('errors/error', { title: 'Not Found', status: 404 })
res.status(201).json({ id: newOrg.id, name: newOrg.name })
res.status(400).json({ error: 'Name is required.' })
```

---

## 3. HTTP Headers

Headers are metadata attached to every request and response.

### Request Headers (sent by the browser)

```
Accept: text/html                  → what formats the browser can handle
Accept-Language: en-US             → preferred language
Authorization: Bearer eyJhb...     → authentication token (Week 5)
Content-Type: application/json     → format of the request body (POST/PUT)
Cookie: session=abc123             → cookies stored on the client
```

### Response Headers (sent by your server)

```
Content-Type: text/html; charset=utf-8   → what you're sending back
Content-Length: 4821                      → byte size of the body
Set-Cookie: session=abc123; HttpOnly      → set a cookie on the client
Cache-Control: no-store                   → browser must not cache this
Location: /login                          → used with 301/302 redirects
```

```js
// Express sets Content-Type automatically
res.render(...)   // Content-Type: text/html
res.json(...)     // Content-Type: application/json

// Override or add headers manually
res.setHeader('X-Custom-Header', 'my-value')
res.setHeader('Cache-Control', 'no-store, max-age=0')
```

---

## 4. MIME Types

MIME types tell the browser how to interpret the response body.

| MIME Type                | Extension      | Use                         |
|--------------------------|----------------|-----------------------------|
| `text/html`              | `.html`, `.ejs`| Web pages                   |
| `text/css`               | `.css`         | Stylesheets                 |
| `application/javascript` | `.js`          | JavaScript                  |
| `application/json`       | `.json`        | API responses               |
| `image/svg+xml`          | `.svg`         | SVG images                  |
| `image/png`              | `.png`         | PNG images                  |

`express.static()` automatically sets the correct MIME type based on file extension — one of its many conveniences.

---

## 5. Server-side Rendering vs. Client-side Rendering

```
SERVER-SIDE RENDERING (SSR) — what this course builds:
  1. Browser requests /categories
  2. Server runs JS + queries DB + fills EJS template
  3. Server returns COMPLETE HTML
  4. Browser displays immediately — fast first paint, great for SEO

CLIENT-SIDE RENDERING (CSR) — React, Vue, Angular:
  1. Browser requests /
  2. Server returns empty <div id="root"></div>
  3. Browser downloads large JS bundle
  4. JS runs, fetches data from an API, builds DOM
  5. Page becomes visible — slower first paint, complex SEO

HYBRID — what large apps use:
  SSR for first load (fast, SEO-friendly), then CSR takes over
```

For CSE 340, SSR with EJS is the right choice. It's simpler, faster to build, and teaches you the fundamentals before framework complexity.

---

## 6. Client vs. Server Responsibilities

```
┌────────────────────────────────┬───────────────────────────────────────┐
│ CLIENT (Browser)               │ SERVER (Node.js/Express)              │
├────────────────────────────────┼───────────────────────────────────────┤
│ Rendering HTML to pixels       │ Routing requests to handlers          │
│ Responding to user events      │ Running business logic                │
│ Animating UI                   │ Querying databases                    │
│ Storing cookies/localStorage   │ Validating and sanitizing input       │
│ Making fetch/Ajax requests      │ Generating complete HTML (EJS)        │
│ Running client-side JS         │ Serving static files                  │
│                                │ Managing sessions/authentication      │
│                                │ Protecting environment variables      │
└────────────────────────────────┴───────────────────────────────────────┘
```

**Key rule:** Never trust the client. All validation that matters for security or data integrity must happen on the server.

---

## 7. REST Principles

REST (Representational State Transfer) is an architectural style for building APIs. Key principles:

1. **Stateless** — each request contains all information needed; server stores no session state between requests (cookies/JWT handle auth separately)
2. **Resource-based URLs** — URLs identify nouns, not actions  
   - Good: `GET /organizations/42`  
   - Bad: `GET /getOrganizationById?id=42`
3. **HTTP verbs for intent** — `GET` reads, `POST` creates, `PUT` replaces, `DELETE` removes
4. **Uniform interface** — consistent, predictable URL patterns

```
REST URL patterns for a "organizations" resource:
  GET    /organizations          → list all organizations
  POST   /organizations          → create a new organization
  GET    /organizations/:id      → get one organization
  PUT    /organizations/:id      → replace one organization
  DELETE /organizations/:id      → delete one organization
```

---

## Practice Exercises

1. Open Chrome DevTools (F12) → Network tab. Visit `http://localhost:3000/categories`. Count how many HTTP requests were made. What status codes do you see?
2. Find a `Content-Type` header in the Network tab. What is it for the HTML page? For the CSS file?
3. Add `res.setHeader('X-Powered-By', 'CSE-340')` in `server.js` before the routes. Can you see this header in DevTools?

---

## How This Connects to Week 2

In Week 2, your controllers will fetch data from a database before calling `res.render()`. The request/response cycle you mapped here is unchanged — you are just inserting an async database step between route matching and rendering.

---

*Next: [04 — Node.js Essentials](./04-nodejs-essentials.md)*
