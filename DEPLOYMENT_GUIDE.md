# 🚀 Deployment Guide: Ancient Manuscript Digitizer

Your application files are ready and committed locally! To make your website live on the internet using GitHub Pages, follow these steps.

## Step 1: Create a GitHub Repository
1. Go to [GitHub.com](https://github.com) and log in.
2. Click the **+** icon in the top right and select **New repository**.
3. Name it `ancient-ocr-frontend`.
4. Make it **Public**.
5. Do **NOT** verify "Initialize this repository with a README/gitignore/license" (keep it empty).
6. Click **Create repository**.

## Step 2: Push Your Code
Copy the commands shown on the GitHub page under "…or push an existing repository from the command line", or use the ones below (replace `YOUR_USERNAME` with your actual GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/ancient-ocr-frontend.git
git branch -M main
git push -u origin main
```

> **Note**: If asked for a password, use your GitHub **Personal Access Token**.
## Step 3: Enable GitHub Pages
1. Once pushed, go to your repository on GitHub.
2. Click **Settings** (top tab).
3. Scroll down (or click on the left sidebar) to **Pages**.
4. Under **Build and deployment** > **Branch**, select `main` (or `master`) from the dropdown.
5. Click **Save**.

## Step 4: Access Your Site
Wait about 1-2 minutes. Your site will be live at:
`https://YOUR_USERNAME.github.io/ancient-ocr-frontend/`

---

## 📱 Mobile Responsiveness
The site is built with a responsive design:
- On desktop, it shows a spacious glassmorphism UI.
- On mobile, it adjusts layout, font sizes, and button widths for touch friendliness.

## 🔒 Security Note
Your Hugging Face API Token is currently embedded in the `script.js` file.
- Since GitHub Pages is public, anyone can view your source code and see this token.
- **Recommendation**: For a production app, use a backend proxy to hide this key. For this demo/portfolio project, ensure you have set budget limits on your Hugging Face account tokens if applicable.
