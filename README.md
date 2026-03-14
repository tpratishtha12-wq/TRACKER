# TRACKER
A web-based study tracker designed for Class 12 board students to manage daily study plans, track subject progress, monitor revision cycles, and improve focus through analytics and goal tracking.

## How this is accessible to the normal public
This project is a **static website** (`index.html`, `styles.css`, `app.js`), so anyone can access it publicly once you host those files on a public web host.

### Option 1: GitHub Pages (free, easiest)
1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch), folder `/ (root)`
4. Save and wait for deployment.
5. GitHub gives you a public URL like:
   `https://<your-username>.github.io/TRACKER/`

### Option 2: Netlify / Vercel (free tiers)
- Connect your GitHub repo.
- Since this is static, no build command is needed.
- Publish directory is the repository root.
- You get a public URL immediately, and can attach a custom domain.

### Option 3: Your own server/domain
- Upload these files to a web server (Nginx/Apache/S3+CloudFront, etc.).
- Point your domain DNS to that host.
- Enable HTTPS so students can access securely.

## Important note about current data storage
The app stores progress in **browser localStorage**.
- Public users can open and use the app immediately.
- Their data stays on their own device/browser.
- If they switch device/browser or clear site data, their records are lost.

If you want shared accounts and cross-device sync for the public, the next step is adding a backend (auth + database + API).
