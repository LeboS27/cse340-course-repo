# Deployment Guide — Render.com

> **CSE 340 Week 1** | Deploys your Tech Charities app from GitHub to a live HTTPS URL.

---

## Prerequisites

- [ ] Node.js 16+ installed locally
- [ ] Git installed and configured
- [ ] GitHub account with this repository pushed to `main`
- [ ] Render.com account (free — sign up at render.com with your GitHub account)

---

## Phase 1: Verify Locally (5 minutes)

Never deploy code that doesn't work locally.

```bash
# Install dependencies
npm install

# Start the server
npm start

# Verify in browser — all 4 routes must return 200
http://localhost:3000/
http://localhost:3000/organizations
http://localhost:3000/projects
http://localhost:3000/categories
http://localhost:3000/notapage    ← must show your custom 404 page
```

---

## Phase 2: Prepare Git (3 minutes)

```bash
# 1. Verify .env is gitignored
git status
# .env should appear as "Untracked files" (red), NOT "Changes to be committed"
# If it appears staged, remove it: git rm --cached .env

# 2. Stage all non-ignored files
git add .

# 3. Review what will be committed
git status
# Expected to see:
#   new file: server.js
#   new file: package.json
#   new file: .env.example
#   new file: routes/index.js
#   new file: controllers/baseController.js
#   new file: controllers/categoriesController.js
#   new file: views/partials/header.ejs
#   new file: views/partials/footer.ejs
#   new file: views/home.ejs
#   new file: views/organizations.ejs
#   new file: views/projects.ejs
#   new file: views/categories.ejs
#   new file: views/errors/error.ejs
#   new file: public/css/styles.css
#   new file: public/images/*.svg

# 4. Commit and push
git commit -m "feat: Week 1 initial site — Tech Charities Express/EJS app"
git push origin main
```

Verify on GitHub.com that `.env` and `node_modules/` are absent from the repository.

---

## Phase 3: Create Render.com Web Service (10 minutes)

### 3.1 — Connect Repository

1. Log in to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Click **Connect** next to your GitHub repository
   - If your repo isn't listed: click **Configure account** → grant access to your repo

### 3.2 — Service Configuration

Fill in these fields exactly:

```
Name:             cse340-tech-charities    (or any name, becomes part of URL)
Region:           Oregon (US West)         (closest to BYU-I Rexburg campus)
Branch:           main
Root Directory:   (leave blank)
Runtime:          Node
Build Command:    npm install
Start Command:    npm start
Instance Type:    Free
```

### 3.3 — Environment Variables

Scroll down to **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |

**Do NOT add `PORT`.** Render injects `PORT` automatically.

### 3.4 — Deploy

Click **Create Web Service**. The first deploy takes 3–5 minutes.

---

## Phase 4: Read the Build Log

Render shows every line of output. Learn to read it:

```
==> Cloning from https://github.com/your-user/cse340-course-repo...
✓ Clone successful

==> Running build command: npm install
added 67 packages in 3.8s
✓ Build successful

==> Starting server: npm start
Server running at http://localhost:10000    ← Render assigned PORT=10000
✓ Service is live at https://cse340-tech-charities.onrender.com
```

### If the Build Fails

```
Error: Cannot find module './routes/index.js'
→ routes/index.js was not pushed to GitHub. Run: git status

Error: ENOENT: no such file or directory, open '.env'
→ Your code is trying to read .env with fs.readFile (wrong approach).
  Import dotenv with: import 'dotenv/config'

SyntaxError: The requested module 'express' does not provide an export named 'default'
→ package.json is missing "type": "module" or import syntax is wrong
```

### If the Server Crashes After Starting

```
Error: listen EADDRINUSE :::3000
→ Never hardcode port 3000. Use: const port = process.env.PORT || 3000

TypeError: Cannot destructure property 'PORT' of 'process.env'
→ dotenv import must be first: import 'dotenv/config' at top of server.js
```

---

## Phase 5: Verify the Live Site

Open your Render URL in an **incognito window** (to avoid cached assets):

```
https://cse340-tech-charities.onrender.com/
https://cse340-tech-charities.onrender.com/organizations
https://cse340-tech-charities.onrender.com/projects
https://cse340-tech-charities.onrender.com/categories
https://cse340-tech-charities.onrender.com/notapage
```

Each page should:
- [ ] Load with full styling (CSS applied)
- [ ] Show correct page title in browser tab
- [ ] Display navigation with working links
- [ ] Show organization images on `/organizations`
- [ ] Show 4 categories on `/categories`
- [ ] Show custom 404 error page on `/notapage`

**Chrome DevTools → Network tab:** Confirm no red 404 errors for CSS or images.

---

## Phase 6: Continuous Deployment

Every future `git push origin main` automatically triggers a new deploy:

```
Development cycle:
  1. Edit code locally
  2. npm run dev — verify in browser at localhost:3000
  3. git add . && git commit -m "description of change"
  4. git push origin main
  5. Render deploys automatically in ~60 seconds
  6. Verify live site
```

---

## Submitting to Canvas

Your Canvas submission must include both:

1. **GitHub Repository URL**  
   `https://github.com/your-username/cse340-course-repo`

2. **Live Render.com URL**  
   `https://cse340-tech-charities.onrender.com`

---

## Troubleshooting Reference

| Symptom | Check |
|---------|-------|
| Site loads but no CSS | Verify `public/css/styles.css` is in GitHub; check path in `<link>` |
| 404 on all pages | Start command may be wrong — should be `npm start` |
| 500 on all pages | Check Render logs for the specific error; usually a missing file or bad import |
| Images missing | Verify SVG files are in `public/images/` in GitHub |
| `.env` visible in GitHub | Run `git rm --cached .env`, add to `.gitignore`, commit again |
| "Spin up" takes 30 seconds | Normal for free tier — server sleeps after 15 minutes of inactivity |
