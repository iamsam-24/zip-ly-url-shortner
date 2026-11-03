# Deploy Ziply

This setup deploys the Node/Express API to Render and the static frontend to Netlify or Vercel. The frontend hosting provider proxies API and short-link requests to Render, so the frontend can keep using its existing relative API URLs and browser login cookies.

## 1. Prepare MongoDB

Use a MongoDB Atlas database (or another reachable MongoDB instance) and copy its connection URI. Make sure the database user has access to the Ziply database. Render's outbound IP addresses aren't fixed on every plan, so configure Atlas network access according to your security requirements; if you temporarily allow `0.0.0.0/0`, use a strong database password and restrict the database user's permissions.

## 2. Deploy the backend to Render

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint**, select the repository, and let Render read [`render.yaml`](./render.yaml).
3. Use the Render service URL `https://ziply-wav0.onrender.com` for the Vercel and `APP_URL` settings below.
4. Enter the requested values:
   - `MONGO_URI`: your MongoDB connection URI.
   - `JWT_SECRET`: a newly generated, long random secret. For example, run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` locally and paste its output into Render.
   - `APP_URL`: use the Render service URL temporarily, including the trailing slash, so initial backend-created links have a valid base. Update it after Vercel is deployed.
5. Deploy the service and wait until it is live. The Render root (`/`) serves the existing public page and is also used as the health check.

`sync: false` in [`render.yaml`](./render.yaml) is a Blueprint YAML instruction, not a setting in Render's Environment dashboard. If you created the web service manually instead of using **New → Blueprint**, open the service's **Environment** tab and add these entries using **Add Environment Variable** (Name and Value):

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB connection URI |
| `JWT_SECRET` | A long random secret generated locally |
| `APP_URL` | `https://ziply-wav0.onrender.com/` initially |

Save changes and let Render redeploy. Do not add a variable named `sync`.

Do not commit these secret values or put them in Netlify or Vercel.

## 3. Deploy the frontend to Netlify

The Netlify site needs the [`frontend/_redirects`](./frontend/_redirects) file in its published directory. Without these proxy rules, `/api/...` requests return Netlify's 404 page and the frontend reports that the service is unreachable.

1. In Netlify, open the existing `zip-ly` site and confirm it is connected to this repository.
2. Set the **Publish directory** to `frontend` (with no build command required for the static HTML/CSS/JavaScript site).
3. Ensure the latest commit containing `frontend/_redirects` is deployed. If the site is deployed manually, redeploy the contents of `frontend` so the `_redirects` file lands at the published root.
4. Once deployed, open `https://zip-ly.netlify.app/api/auth/me`. A `401 Unauthorized` JSON/API response is expected when logged out; a Netlify HTML `404 Page not found` means the redirect rules were not included in the deployed publish directory.

## 4. Deploy the frontend to Vercel (alternative)

1. In Vercel, import the same GitHub repository.
2. Set **Root Directory** to `frontend`; use the **Other** framework preset. No build command or output directory is required—the frontend is static HTML, CSS, and JavaScript.
3. Deploy. The [`frontend/vercel.json`](./frontend/vercel.json) rewrites `/api/...` and short links (`/<id>`) to `https://ziply-wav0.onrender.com`.

## 5. Set the public short-link domain

After Netlify or Vercel is live, set the Render `APP_URL` environment variable to the frontend's public URL, with a trailing slash (for example, `https://zip-ly.netlify.app/`). Save the change and let Render redeploy.

New shortened URLs will then use the frontend's domain; Netlify or Vercel forwards visits to those links to Render for redirection. Existing URLs already stored in the database are not modified.

## 6. Smoke-test

- Open the Netlify or Vercel URL and shorten a valid destination URL.
- Open the returned link in a private/incognito window and confirm it redirects.
- Register or log in, reload, and confirm the session remains active.
- Confirm the Render logs show a successful MongoDB connection.

On Render's free web-service plan, the first request after inactivity may take longer while the service starts.
