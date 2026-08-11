# Decap GitHub OAuth Worker

GitHub requires a server-side OAuth component for the Decap GitHub backend. This folder is a starter Cloudflare Worker.

1. Create a GitHub OAuth App.
2. Set its callback URL to `https://YOUR-WORKER-DOMAIN/callback`.
3. Configure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as Worker secrets.
4. Deploy the Worker.
5. Set `base_url` in `admin/config.yml` to the Worker domain.
6. Set the OAuth App homepage URL to your GitHub Pages site.

Never commit the client secret to GitHub.
