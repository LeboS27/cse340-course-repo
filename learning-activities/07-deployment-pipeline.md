# Learning Activity 07 — Deployment Pipeline

> **Course:** BYU-I CSE 340 Web Backend Development — Week 1  
> **Outcome:** Deploy a Node.js/Express/EJS application to Render.com from a GitHub repository, configure environment variables, and understand the difference between development and production.

---

## Development vs. Production

```
DEVELOPMENT (your laptop)                PRODUCTION (Render.com server)
─────────────────────────────────────    ─────────────────────────────────────
npm run dev (nodemon, hot reload)        npm start (node server.js, stable)
NODE_ENV=development                     NODE_ENV=production
.env file holds secrets                  Render dashboard holds secrets
Detailed error messages shown            Generic error messages shown
Any port (3000)                          PORT injected by Render
localhost:3000                           https://your-app.onrender.com
```

---

## 1. Prerequisite: Your Repository is Ready

Before deploying, verify locally:

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start

# 3. Check all routes respond
curl http://localhost:3000/            # should get 200 with HTML
curl http://localhost:3000/organizations
curl http://localhost:3000/projects
curl http://localhost:3000/categories
curl http://localhost:3000/notapage   # should get 404 error page
```

If any of these fail locally, fix them before deploying. Render.com mirrors what runs locally.

---

## 2. Environment Variables — The Critical Checklist

```bash
# ✓ MUST be gitignored (your .gitignore already does this):
.env

# ✓ MUST be committed (serves as documentation):
.env.example

# .env.example — what you share publicly:
PORT=3000
NODE_ENV=development

# .env — what you keep private (never in git):
PORT=3000
NODE_ENV=development
# Week 2 will add:
# DATABASE_URL=postgresql://user:password@host/dbname
```

**Verify your `.env` is not tracked:**
```bash
git status      # .env should NOT appear here
git ls-files | grep .env    # should return nothing (or only .env.example)
```

---

## 3. Push to GitHub

```bash
# Stage all files EXCEPT those in .gitignore
git add .
git status    # review what's staged — confirm .env is absent

git commit -m "feat: Week 1 initial site — Express/EJS Tech Charities app"
git push origin main
```

Your repository should contain:
```
✓ server.js
✓ package.json
✓ .env.example
✓ routes/
✓ controllers/
✓ views/
✓ public/
✗ .env        (gitignored — must NOT be here)
✗ node_modules/ (gitignored — must NOT be here)
```

---

## 4. Deploy to Render.com — Step by Step

### Step 1: Create Account
Go to [render.com](https://render.com) → Sign up with GitHub. Authorizing GitHub lets Render see your repositories.

### Step 2: New Web Service
Dashboard → **New** → **Web Service** → Connect your GitHub repository.

### Step 3: Configure the Service

| Field | Value |
|-------|-------|
| **Name** | `cse340-tech-charities` (or your choice) |
| **Region** | Oregon (US West) — closest to BYU-I |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### Step 4: Add Environment Variables

In the **Environment** section, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |

> Do NOT add `PORT`. Render injects it automatically. Your `server.js` reads it with `process.env.PORT || 3000`.

### Step 5: Deploy

Click **Create Web Service**. Render will:
1. Clone your repository
2. Run `npm install` (installs only `dependencies`, not `devDependencies`)
3. Run `npm start` (`node server.js`)
4. Make your app available at `https://your-app-name.onrender.com`

Watch the build log for errors. Common issues are listed in Step 6.

---

## 5. Render.com Build Log — Reading the Output

```
==> Cloning from https://github.com/your-user/cse340-course-repo...
==> Detected Node version: 20.x.x
==> Running build command: npm install
    added 67 packages in 4s
==> Starting server: npm start
    Server running at http://localhost:10000   ← Render assigns PORT 10000
==> Your service is live at https://cse340-tech-charities.onrender.com
```

**If you see errors:**
```
Error: Cannot find module './routes/index.js'
→ Import path is wrong or file is missing. Check routes/index.js exists.

Error: ENOENT: no such file or directory, open 'views/home.ejs'
→ Views path misconfigured in server.js. Verify join(__dirname, 'views').

Error: dotenv is not defined
→ Import 'dotenv/config' is missing from server.js top.
```

---

## 6. Automatic Redeploys

Every `git push origin main` triggers a new deploy automatically. The workflow becomes:

```
Edit code locally → npm run dev (verify) → git add . && git commit → git push
Render detects the push → rebuilds → new version live in ~1 minute
```

---

## 7. `package.json` Scripts Explained

```json
"scripts": {
  "start": "node server.js",     ← Render uses this (production)
  "dev":   "nodemon server.js"   ← You use this locally (development)
}
```

```bash
npm start       # runs: node server.js   — no hot reload, stable
npm run dev     # runs: nodemon server.js — hot reload on file changes
```

---

## 8. Testing Your Deployed Site

After deployment, test every route:

```bash
# Replace with your actual Render URL
BASE=https://cse340-tech-charities.onrender.com

curl -o /dev/null -s -w "%{http_code}" $BASE/             # expect 200
curl -o /dev/null -s -w "%{http_code}" $BASE/organizations # expect 200
curl -o /dev/null -s -w "%{http_code}" $BASE/projects      # expect 200
curl -o /dev/null -s -w "%{http_code}" $BASE/categories    # expect 200
curl -o /dev/null -s -w "%{http_code}" $BASE/notapage      # expect 404
```

Also verify in a browser:
- [ ] CSS loads (page is styled, not plain HTML)
- [ ] SVG images appear on the Organizations page
- [ ] Navigation links work on all 4 pages
- [ ] `/notapage` shows your custom 404 error page (not a Render default)
- [ ] Mobile layout at 375px width (Chrome DevTools → Device Toolbar)

---

## 9. Free Tier Limitations

Render's free tier spins down your server after 15 minutes of inactivity. The first request after spin-down takes ~30 seconds. This is expected behavior — not a bug. Paid tiers stay warm.

For the purposes of grading, spin-up delay is acceptable.

---

## 10. Security on Render.com

```
✓ HTTPS is automatic — Render provisions a TLS certificate
✓ Environment variables in Render dashboard are encrypted at rest
✓ Never print process.env in production logs — they appear in Render's log stream
✓ Your .env file never leaves your local machine
```

---

## Deployment Checklist

```
Pre-deploy (local):
  [ ] npm install runs without errors
  [ ] npm start launches without errors
  [ ] All 4 pages load (/, /organizations, /projects, /categories)
  [ ] /notapage returns custom 404
  [ ] .env is gitignored (git status shows it as untracked, not staged)
  [ ] .env.example is committed
  [ ] node_modules/ is gitignored

GitHub:
  [ ] All code is pushed to main branch
  [ ] .env is NOT visible in the GitHub repository
  [ ] node_modules/ is NOT in the repository

Render.com:
  [ ] Build command: npm install
  [ ] Start command: npm start
  [ ] NODE_ENV=production is set in environment variables
  [ ] Deploy log shows no errors
  [ ] Live URL loads all 4 pages with styling
  [ ] Submit: GitHub URL + Render URL to your instructor
```

---

## How This Connects to Week 2

Week 2 adds a database. On Render.com, you will add a `DATABASE_URL` environment variable pointing to your hosted database. Your server.js and model files read it exactly the same way they read `PORT` — through `process.env`. The deployment pipeline does not change.

---

*You've completed all 7 learning activities. You're ready to build and deploy your Week 1 site!*
