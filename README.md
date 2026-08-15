# Nithin S P Portfolio

GitHub Pages-ready portfolio with a Deep Navy + Electric Blue theme and Decap CMS.

## Repository
`Nithinsp-1522/nithin-portfolio`

## Live site
`https://nithinsp-1522.github.io/nithin-portfolio/`

## Admin
`https://nithinsp-1522.github.io/nithin-portfolio/admin/`

The CMS edits:
- Hero and contact details
- About text
- What I Do
- Skills
- Education
- Why Me
- All projects
- Project images, technologies and links
- Design gallery (homepage, unchanged)
- Design Portfolio folders and their images (managed separately in the Design Portfolio CMS collection)
- Footer

## Important CMS authentication note
The GitHub backend needs a server-side OAuth component. Decap documents this requirement and supports an OAuth proxy/worker approach. See the included `oauth-worker/` starter. The GitHub OAuth client secret must be stored as a Worker secret, never in this repository.

## GitHub Pages
The included `.github/workflows/pages.yml` deploys the repository to GitHub Pages on pushes to `main`.
