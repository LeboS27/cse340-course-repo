# 60-Second Status Update — Week 1

> **CSE 340 — Web Backend Development**  
> This brief reflection is submitted alongside your Week 1 assignment. Answer each prompt honestly in 1–3 sentences. Authenticity matters more than polish.

---

## Your Name
Lebohang Sebata

## Date
<!-- Fill in today's date -->

---

## Prompt 1: Which concept took the longest to understand, and why?

> *Think about the moment something finally "clicked." What was confusing before that moment? What made it clear?*

Write your answer here:

---

## Prompt 2: Which of the 7 learning activities was most valuable to you personally?

> *Choose one: JavaScript Fundamentals, File & URL Paths, Server-side Fundamentals, Node.js Essentials, Express & Routing, EJS Templates, or Deployment. Explain why it helped you specifically.*

Write your answer here:

---

## Prompt 3: What is one question you still have for your instructor?

> *This is your chance to surface genuine confusion before Week 2 builds on it. There are no bad questions here.*

Write your answer here:

---

## Prompt 4: How will you apply this week's learning to Week 2's inventory system?

> *Week 2 adds a database and a `/inv` route with real data. What specific thing from Week 1 do you expect to build directly on?*

Write your answer here:

---

## Submission Checklist

Before submitting this reflection and your assignment, confirm:

- [ ] GitHub repository URL is working and public (or shared with instructor)
- [ ] Render.com deployment URL is live and accessible
- [ ] All 4 pages render correctly on the live site
- [ ] `.env` file is NOT in your GitHub repository
- [ ] Both the repo and live site URLs are in your Canvas submission

---

## Example Responses (for reference — write your own!)

**Prompt 1 example:**  
"The ESM `__dirname` reconstruction took the most time. I kept getting `ReferenceError: __dirname is not defined` and didn't understand why it worked in tutorial videos but not my code. It clicked when I realized those tutorials used CommonJS (`require`) and ESM removes `__dirname` by design — you reconstruct it from `import.meta.url`."

**Prompt 2 example:**  
"The Server-side Fundamentals activity was most valuable. I had built web pages before but never understood what was actually happening between me typing a URL and seeing a page. Seeing the full HTTP request/response cycle — DNS, TCP, headers, status codes — filled in a gap I didn't know I had."

**Prompt 3 example:**  
"In the error handler, `process.env.NODE_ENV === 'development'` shows detailed errors. But how do I safely show *enough* detail to debug a production issue without exposing system internals? What's the right level of information for a production error message?"

**Prompt 4 example:**  
"The `async/await` + `try/catch` + `next(err)` controller pattern will apply directly to Week 2. Every controller function I write for the inventory will use that same shape — the only difference is that instead of returning a hardcoded array, I'll `await` a model function that queries the database."
