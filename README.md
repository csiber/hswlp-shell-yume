# Yume

Yume is a serverless music and image sharing platform built with Nuxt 3 and Cloudflare Workers. It uses Cloudflare Pages for hosting static assets and Workers for the API layer, so no separate backend server is required.

## Architecture

- **Nuxt 3 + Tailwind + Pinia** frontend
- **Cloudflare Workers** handle API routes
- **D1 database** stores users and posts
- **R2 object storage** keeps uploaded files
- JWT based authentication stored locally

## Development

```bash
pnpm install
cp .env.example .env
pnpm db:migrate:dev
pnpm dev
```

Then open `http://localhost:3000`.

## Deployment

Build and deploy with Wrangler:

```bash
pnpm run deploy
```

Environment secrets from `.env` must be uploaded with `wrangler secret put` before deploying.

## Usage Guide & Policy

See [docs/USAGE_GUIDE.md](docs/USAGE_GUIDE.md) for instructions on how to use the system and details about the content policy.

## License

This project is released under the MIT License.
