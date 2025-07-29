````markdown
# Yume 🎧✨ – AI content, community vibes, music and visual magic in one place

This repository contains the frontend called **Yume**, built on the new generation HSWLP system (hswlp-next). It is a **modern, static frontend** application running entirely on the **Cloudflare Pages + Workers** infrastructure – there's no need for a separate backend or server.

This release is **version 1.0**, considered stable and ready for production use.

> Yume uniquely combines AI-generated music, images, prompts and a community feed system. It can run entirely on its own, even under your own domain.

---

## 🚀 How to deploy your own copy (after purchase)

Don't worry, you don't need to be a tech expert. Here's a step-by-step guide to get your own Yume running.

### 1. 🔄 Extract the package

After purchasing Yume:

- Download the `.zip` package
- Extract it to a folder on your machine

If you received it as a GitHub repo:

```bash
git clone https://github.com/sajat-felhasznalo/yume-projekt.git
cd yume-projekt
```
````

---

### 2. ⚙️ Required accounts and tools

The system uses **Cloudflare** services. You will need:

- ✅ A [Cloudflare account](https://dash.cloudflare.com/)
- ✅ Installed `pnpm` (or `npm`, but pnpm is recommended)
- ✅ [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) – used for deployments

> 📦 Don't worry, all necessary settings are explained below.

---

### 3. 🧪 First launch (locally)

If you just want to test it, run:

```bash
pnpm install
cp .env.example .env
pnpm db:migrate:dev
pnpm dev
```

Then open:
[http://localhost:3000](http://localhost:3000)

---

### 4. ☁️ Deploy to Cloudflare (one command!)

Instead of a deploy button, there's a simple command:

```bash
pnpm run deploy
```

This uploads:

- the website (static assets)
- Cloudflare Worker code
- the D1 database connection
- R2 storage integration
- KV session handling
- secret keys (only if you set them before)

⚠️ **Important:** the secret data in the `.env` file won't be uploaded automatically. You can set them like this:

```bash
npx wrangler secret put EMAIL_API_KEY
```

or manually on the Cloudflare dashboard.

---

### 5. 📁 Useful files if you want to customize

- Constants: `src/constants.ts`
- Meta / SEO: `src/app/layout.tsx`
- Email templates: `src/react-email/`
- Styles: `src/app/globals.css`
- DB migrations: `prisma/migrations`
- Cloudflare config: `wrangler.toml`

---

## 🔐 What features do you get out of the box?

- Sign in, registration, email verification
- Cloudflare D1 database usage
- Upload to R2 (images, music, prompts)
- Community feed
- Music player that keeps playing across pages
- Favorites and playlists
- Stripe integration for payments (if configured)
- Webhook system (if you're technical)
- Stripe webhook route: `/api/stripe/webhook` (authenticated with `STRIPE_WEBHOOK_SECRET`)

---

## 💬 Important message from me

This system isn't a template. It's a foundation for your own AI-driven community project – you won't rent it, it will be yours.

The code isn't locked down: it's extendable and customizable. If you get stuck anywhere, message me and I'll help.

My goal isn't just to sell it – it's to make it work **for you**.

---

## 🛠️ Bonus: I'll set it up for you if you want

If you're not tech-savvy but want your own Yume:

→ Feel free to reach out and I'll set it up for you, whether on your own domain, subdomain, under Cloudflare or elsewhere.

---


Thank you for placing your trust in me!
Enjoy using it and create something special!

— Csiber 🤝

```
```
