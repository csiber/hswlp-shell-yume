# Yume – Serverless Music & Image Sharing Platform

**Yume** is a serverless platform for sharing music and images,  
built with **Nuxt 3** and **Cloudflare Workers**.  

It leverages **Cloudflare Pages** for static hosting and **Workers** for the API layer,  
so no separate backend server is required.  

This repository reflects **version 1.0**, marking the platform as **stable and feature-complete**.  

---

## ✨ Features

- 🎵 **Music Sharing** – upload and stream audio files  
- 🖼️ **Image Sharing** – post and preview images instantly  
- 🔐 **Authentication** – JWT-based, stored locally  
- 🗄️ **Database** – Cloudflare D1 for users and posts  
- ☁️ **Storage** – Cloudflare R2 for file hosting  
- ⚡ **Serverless Architecture** – no traditional backend required  

---

## 🛠️ Architecture

- **Frontend:** Nuxt 3 + TailwindCSS + Pinia  
- **API:** Cloudflare Workers  
- **Database:** D1 (SQL)  
- **Storage:** R2 object storage  
- **Auth:** JWT tokens stored locally  

---

## 🚀 Development

1. Install dependencies:

   ```bash
   pnpm install

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

3. Run database migrations & start dev server:

   ```bash
   pnpm db:migrate:dev
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment

Deploy with Wrangler:

```bash
pnpm run deploy
```

> ⚠️ Before deploying, make sure to upload all environment secrets with:
> `wrangler secret put`

---

## 📖 Documentation

See [docs/USAGE\_GUIDE.md](docs/USAGE_GUIDE.md) for:

* How to use the platform
* Content guidelines & policies

---

## 📜 License

Released under the **MIT License**.

---

**Yume** demonstrates how a **Cloudflare-native, serverless application**
can deliver a seamless user experience for creative sharing.
