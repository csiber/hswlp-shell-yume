# ✅ YUMEKAIRA PLATFORM TODO

Yumekaira: AI-kép és zene megosztó, közösségi platform.
Funkciók: generált tartalmak feltöltése, feed, AI-asszisztensek, globális zenelejátszó, kredites piactér, profilrendszer.

---

## 📦 0. ALAPSTRUKTÚRA

- [ ] Projektmappa létrehozása (`yumekaira-app`)
- [ ] Frontend: Vue 3 + Vite + TailwindCSS
- [ ] Backend: Laravel API / Cloudflare Worker / edge setup
- [ ] Auth: Cloudflare Access vagy Supabase / Laravel Sanctum
- [ ] Routing setup (SPA):
  - `/` → landing
  - `/dashboard` → belépett felhasználóknak (feed)
  - `/market` → piactér
  - `/upload` → új tartalom
  - `/profile/:id`

---

## 🎨 1. LANDING OLDAL

- [ ] Hero szekció: Yumekaira bemutatása (szlogen + CTA)
- [ ] Fő funkciók kiemelése (pl. AI kép generálás, zenelejátszó)
- [ ] Screenshot vagy demo preview komponens
- [ ] Regisztráció / Belépés gomb
- [ ] SEO: title, description, Open Graph, favicon stb.

---

## 🧭 2. DASHBOARD (KÖZÖSSÉGI FEED)

- [ ] `Dashboard.vue` → Cruip alapú grid layout
- [ ] `Sidebar.vue` → bal menü (navigáció)
- [ ] `PostCard.vue` → kártya: kép, zene, prompt
- [ ] `RightColumn.vue` → felfedezés, top szerzők
- [ ] Feed adatok dummy JSON-ből

---

## 🎵 3. GLOBÁLIS ZENELEJÁTSZÓ

- [ ] `AudioPlayer.vue` → layout alján mindig jelen van
- [ ] Pinia store: zeneállapot (`play/pause/track`)
- [ ] Mobilon is elérhető, kis sávban
- [ ] Vizuális waveform (opcionális)

---

## 📤 4. FELTÖLTÉS ÉS AI FUNKCIÓK

- [ ] `UploadImage.vue` → fájl kiválasztása + preview
- [ ] Kép leírás generálás (Cloudflare AI `describe`)
- [ ] Leírás → prompt generálás (LLM `llama-3`)
- [ ] Prompt mentése a poszthoz
- [ ] Címke generálás (hashtag AI)

---

## 🤖 5. CLOUDFLARE AI INTEGRÁCIÓ

- [ ] AI router a frontend + Worker között
- [ ] Promptgenerálás endpoint (POST `/api/ai/prompt`)
- [ ] Képleírás endpoint (POST `/api/ai/describe`)
- [ ] Zene műfaj felismerés (POST `/api/ai/genre`)
- [ ] Prompt preview funkció poszt előtt

---

## 🛒 6. PIACTÉR + KREDIT RENDSZER

- [ ] `Marketplace.vue` → böngészés, szűrők
- [ ] `ContentCard.vue` → eladó tartalom (kép, zene, prompt)
- [ ] Stripe Checkout integráció (kredit vásárlás)
- [ ] Kredit wallet (profilban)
- [ ] Vásárlás logika: kredit levonás, hozzáférés biztosítása
- [ ] Saját bolt: eladások, bevétel statisztika (`MyStore.vue`)
- [ ] Platform fee beállítása (pl. 10% jutalék)

---

## 👤 7. PROFIL ÉS KÖZÖSSÉG

- [ ] `UserProfile.vue` → tartalmak, követők, bio
- [ ] Követés / támogatás funkció (Stripe tip)
- [ ] Kommentszekció poszt alatt
- [ ] Mentés / kedvencek
- [ ] Remix funkció (új generálás meglévő promptból)

---

## 🛡️ 8. ADMIN / MODERÁLÁS (később)

- [ ] Tartalom moderálás (jelentés / törlés)
- [ ] Eladások, statisztikák, kifizetések
- [ ] Felhasználók kezelése
- [ ] AI logok monitorozása

---

## 🧪 9. EXTRA FUNKCIÓK (PRO)

- [ ] AI chat prompt segítő (oldalsávban)
- [ ] Feed személyre szabás (címkék / stílus alapján)
- [ ] Integráció más AI platformokkal (pl. Suno, PlayHT)
- [ ] Plugin piactér (kódolt sablonok eladása)

---

## ☁️ 10. DEPLOY ÉS INFRA

- [ ] Cloudflare Pages deploy (SPA frontend)
- [ ] Cloudflare Worker / Functions (API, AI)
- [ ] D1 (SQLite) vagy Supabase / PlanetScale (adatokhoz)
- [ ] R2 (tárolt képek, zenék)
- [ ] Worker cron: top posztok / AI cache / stat frissítés

---

## ✅ KÉSZENLÉT / INDÍTÁS

- [ ] Első 20 poszt (demo képek / zenék)
- [ ] Tesztfelhasználók (3–5 account)
- [ ] Stripe teszt vásárlás
- [ ] Feedback szekció / support chat
- [ ] Public launch / link megosztás
