# goChat Deployment Guide

To put your project online (on the internet), you need to upload your source code to **GitHub** first, and then connect your GitHub repository to **Vercel** (for the backend) and **Netlify** (for the frontend). 

Here is exactly how to do it start-to-finish:

## Step 1: Push your code to GitHub
Vercel and Netlify need to pull your code from a Git repository. To do this:

1. Create a free account on [GitHub.com](https://github.com) if you don't have one.
2. In the top right corner of GitHub, click the **+** icon and select **New repository**. Name it `gochat` and create it.
3. Open a **new Terminal window** in VSCode (making sure you are in the `i:\html\goChat` folder) and run these commands to upload your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
# *Replace the URL below with your actual GitHub repository URL from step 2*
git remote add origin https://github.com/YourUsername/gochat.git
git push -u origin main
```

*(Note: Don't worry about uploading your `.env` passwords—the `.gitignore` file automatically hides them so they stay safe!)*

---

## Step 2: Deploy the Backend to Vercel
Your server is built with Express and is pre-configured to run on Vercel as a Serverless Function.

1. Go to [Vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New... > Project**.
3. Find your `gochat` repository and click **Import**.
4. **IMPORTANT**: In the "Root Directory" section, click Edit and select the `server` folder.
5. In the **Environment Variables** section, copy and paste the values from your `server/.env` file:
   - `SUPABASE_URL` = (Your Supabase URL)
   - `SUPABASE_SERVICE_ROLE_KEY` = (Your Service Role Key)
   - `FRONTEND_URL` = (Leave this empty for a second, we will fill it in later!)
6. Click **Deploy**. Vercel will process your server and give you a live URL (e.g., `https://gochat-api.vercel.app`). Copy this URL!

---

## Step 3: Deploy the Frontend to Netlify
Your client is built with React/Vite and is pre-configured for Netlify routing.

1. Go to [Netlify.com](https://netlify.com) and log in with your GitHub account.
2. Click **Add new site > Import an existing project**.
3. Select GitHub and pick the `gochat` repository.
4. **IMPORTANT**: Change the "Base directory" to `client`. (The build command will automatically update to `npm run build` and publish directory to `dist`).
5. Click **Add environment variables** and add the keys from your `client/.env` file:
   - `VITE_SUPABASE_URL` = (Your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY` = (Your Anon Key)
   - `VITE_API_URL` = **Paste the Vercel URL you got from Step 2 here!** (e.g., `https://gochat-api.vercel.app` — no slash at the end!)
6. Click **Deploy site**. Netlify will build your React app and give you a live URL (e.g., `https://my-gochat.netlify.app`).

---

## Step 4: Final Link-up
Now that both the live API and live Frontend are online, we need to tell them about each other and Supabase:

1. **Vercel CORS Settings**: Go back to your Vercel Dashboard for your backend project. Go to **Settings > Environment Variables** and update `FRONTEND_URL` to be your shiny new Netlify URL (`https://my-gochat.netlify.app`). This allows your frontend to send requests to your API. Then, REDEPLOY your Vercel app so the changes take effect!
2. **Supabase Auth URL**: Go to your Supabase Dashboard. Navigate to **Authentication > URL Configuration**. Change the **Site URL** from `http://localhost:5173` to your Netlify URL! This ensures the verification emails point users to the real app on the internet instead of localhost.
