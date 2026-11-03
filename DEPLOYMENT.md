# Deploy Ziply

This setup deploys the Node/Express API to Render and the static frontend to Vercel. Vercel proxies API and short-link requests to Render, so the frontend can keep using its existing relative API URLs and browser login cookies.

## 1. Prepare MongoDB

Use a MongoDB Atlas database (or another reachable MongoDB instance) and copy its connection URI. Make sure the database user has access to the Ziply database. Render's outbound IP addresses aren't fixed on every plan, so configure Atlas network access according to your security requirements; if you temporarily allow `0.0.0.0/0`, use a strong database password and restrict the database user's permissions.

## 2. Deploy the backend to Render

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint**, select the repository, and let Render read [`render.yaml`](./render.yaml).
3. Keep the service name `ziply-backend` so it uses `https://ziply-backend.onrender.com`. If Render assigns a different service URL, use that actual URL in the Vercel and `APP_URL` settings below.
4. Enter the requested values:
   - `MONGO_URI`: your MongoDB connection URI.
   - `JWT_SECRET`: a newly generated, long random secret. For example, run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` locally and paste its output into Render.
   - `APP_URL`: use the Render service URL temporarily, including the trailing slash, so initial backend-created links have a valid base. Update it after Vercel is deployed.
5. Deploy the service and wait until it is live. The Render root (`/`) serves the existing public page and is also used as the health check.

Do not commit these secret values or put them in Vercel.

## 3. Deploy the frontend to Vercel

1. In Vercel, import the same GitHub repository.
2. Set **Root Directory** to `frontend`; use the **Other** framework preset. No build command or output directory is required—the frontend is static HTML, CSS, and JavaScript.
3. Deploy. The [`frontend/vercel.json`](./frontend/vercel.json) rewrites `/api/...` and short links (`/<id>`) to the Render backend. It is preconfigured for `https://ziply-backend.onrender.com`.
4. If the Render URL differs, update both rewrite destinations in `frontend/vercel.json` to the actual Render URL and redeploy Vercel.

## 4. Set the public short-link domain

After Vercel is live, set the Render `APP_URL` environment variable to the Vercel deployment's public URL, with a trailing slash (for example, `https://your-project.vercel.app/`). Save the change and let Render redeploy.

New shortened URLs will then use the Vercel domain; Vercel forwards visits to those links to Render for redirection. Existing URLs already stored in the database are not modified.

## 5. Smoke-test

- Open the Vercel URL and shorten a valid destination URL.
- Open the returned link in a private/incognito window and confirm it redirects.
- Register or log in, reload, and confirm the session remains active.
- Confirm the Render logs show a successful MongoDB connection.

On Render's free web-service plan, the first request after inactivity may take longer while the service starts.
