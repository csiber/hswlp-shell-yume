````markdown
# Yume 🎧✨ – AI tartalmak, közösségi élmény, zene és vizuális varázslat egy helyen

Ez a repository a **Yume** nevű frontendet tartalmazza, amely a HSWLP újgenerációs rendszerére épül (hswlp-next). Egy **modern, statikus frontend** alkalmazás, ami teljes egészében a **Cloudflare Pages + Workers** infrastruktúrán működik – nincs szükség külön backendre vagy szerverre.

> A Yume egyedülálló kombinációja az AI-generált zenéknek, képeknek, promtoknak és egy közösségi feed rendszernek. Teljesen önállóan is futtatható, akár saját domain alatt is.

---

## 🚀 Hogyan telepítsd a saját példányodat (vásárlás után)

Ne aggódj, nem kell informatikusnak lenned. Itt egy lépésről-lépésre útmutató, hogy elindítsd a saját Yumédat.

### 1. 🔄 Csomag kibontása

Ha megvetted a Yume-t:

- Töltsd le a `.zip` csomagot
- Csomagold ki egy mappába a gépeden

Ha GitHub repo formájában kaptad meg:

```bash
git clone https://github.com/sajat-felhasznalo/yume-projekt.git
cd yume-projekt
```
````

---

### 2. ⚙️ Szükséges fiókok és eszközök

A rendszer a **Cloudflare** szolgáltatásait használja. Szükséged lesz:

- ✅ Egy [Cloudflare fiók](https://dash.cloudflare.com/)
- ✅ Telepített `pnpm` (vagy `npm`, de ajánlott a pnpm)
- ✅ [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) – ezt használjuk deployolásra

> 📦 Ne aggódj, minden szükséges beállítást elmagyarázunk lent.

---

### 3. 🧪 Első indítás (lokálisan)

Ha csak tesztelni szeretnéd, futtasd így:

```bash
pnpm install
cp .env.example .env
pnpm db:migrate:dev
pnpm dev
```

Ezután nyisd meg:
[http://localhost:3000](http://localhost:3000)

---

### 4. ☁️ Élesítés Cloudflare-re (1 parancs!)

A deploy gomb helyett itt egy egyszerű parancs:

```bash
pnpm run deploy
```

Ez feltölti a:

- weboldalt (statikus assetek)
- Cloudflare Worker kódot
- D1 adatbázis kapcsolatot
- R2 tárhely integrációt
- KV session kezelést
- titkos kulcsokat (csak ha előtte beállítottad)

⚠️ **Fontos:** a `.env` fájlban szereplő titkos adatok nem kerülnek feltöltésre automatikusan. Ezeket így tudod megadni:

```bash
npx wrangler secret put EMAIL_API_KEY
```

vagy a Cloudflare dashboardon manuálisan.

---

### 5. 📁 Hasznos fájlok, ha belenyúlnál

- Állandó beállítások: `src/constants.ts`
- Meta / SEO dolgok: `src/app/layout.tsx`
- Email sablonok: `src/react-email/`
- Stílusok: `src/app/globals.css`
- DB migrációk: `prisma/migrations`
- Cloudflare config: `wrangler.toml`

---

## 🔐 Milyen funkciókat kapsz alapból?

- Belépés, regisztráció, email megerősítés
- Cloudflare D1 adatbázis használat
- Feltöltés R2-be (képek, zenék, promtok)
- Közösségi feed
- Zenelejátszó, ami oldalváltáskor is szól
- Kedvencek, lejátszási listák
- Stripe integráció fizetéshez (ha beállítod)
- Webhook rendszer (ha technikai vagy)
- Stripe webhook útvonala: `/api/stripe/webhook` (a `STRIPE_WEBHOOK_SECRET` változóval hitelesítve)

---

## 💬 Fontos üzenet tőlem

Ez a rendszer nem sablon. Ez egy _alap_ arra, hogy saját AI-alapú közösségi projekted legyen – nem bérelni fogod, hanem a tiéd lesz.

A kód nem zárolt, fejleszthető, testreszabható. Ha bárhol elakadsz, írj nekem, segítek.

A célom nem az, hogy csak eladjam – hanem hogy működjön **neked**.

---

## 🛠️ Bónusz: ha szeretnéd, beállítom helyetted

Ha nem vagy technikai beállítottságú, de szeretnél saját Yumét:

→ Írj bátran, és igény szerint beállítom neked, akár saját domainre, akár subdomainre, akár Cloudflare alatt, akár máshol.

---

## 🌐 Jövőbeli bővítések (vásárlás után ingyen jönnek)

- Komment rendszer
- Profil oldalak
- Kereső
- Megosztás funkció
- Privát tartalom feltöltés
- Beépített AI promptgenerátor
- Moderációs eszközök

---

Köszönöm, hogy bizalmat szavaztál!
Használd örömmel, és hozz létre valami különlegeset!

— Csiber 🤝

```

```
