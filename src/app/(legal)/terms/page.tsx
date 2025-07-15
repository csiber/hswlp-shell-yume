import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CREDITS_EXPIRATION_YEARS } from "@/constants";

export const metadata: Metadata = {
  title: "Felhasználási feltételek",
  description:
    "Olvasd el a Yumekai használati feltételeit és szolgáltatási szabályzatát.",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="text-4xl font-bold text-foreground mb-8">
        Felhasználási feltételek
      </h1>

      <p className="text-muted-foreground mb-6">
        Utolsó frissítés: {new Date().toLocaleDateString("hu-HU")}
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          1. A feltételek elfogadása
        </h2>
        <p className="text-muted-foreground">
          A weboldal elérésével és használatával elfogadod, hogy jelen
          felhasználási feltételek rád nézve kötelező érvényűek.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          2. Használati engedély
        </h2>
        <p className="text-muted-foreground">
          A Yumekai platform tartalma egy példányban, személyes és nem
          kereskedelmi célra letölthető és megtekinthető, ideiglenes jelleggel.
          Minden egyéb felhasználás előzetes írásos engedélyhez kötött.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          3. Felelősségkizárás
        </h2>
        <p className="text-muted-foreground">
          A weboldalon elérhető tartalmak „jelen állapotukban” kerülnek
          biztosításra. A Yumekai nem vállal sem kifejezett, sem hallgatólagos
          garanciát, többek között nem garantálja az adott célra való
          alkalmasságot vagy a szellemi tulajdonjogok megsértésének hiányát.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          4. Kreditrendszer és fizetések
        </h2>
        <p className="text-muted-foreground mb-4">
          A Yumekai működése kreditalapú rendszerre épül. A megvásárolt kreditek{" "}
          {CREDITS_EXPIRATION_YEARS} évig érvényesek a vásárlás napjától
          számítva. A fizetések biztonságosan, Stripe-en keresztül történnek.
        </p>
        <p className="text-muted-foreground mb-4">
          Sikeres fizetés után a kreditek azonnal jóváírásra kerülnek a
          felhasználói fiókodban. A vásárolt kreditekre visszatérítést nem
          biztosítunk. A csomagok ára és elérhetősége előzetes értesítés nélkül
          is változhat.
        </p>
        <p className="text-muted-foreground">
          Ingyenes kreditek időszakos promóciók vagy havi kiosztások részeként
          is elérhetőek lehetnek. Ezekre eltérő szabályok és lejárati feltételek
          vonatkozhatnak, amelyekről az adott alkalommal külön tájékoztatást
          adunk.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          5. Korlátozások
        </h2>
        <p className="text-muted-foreground">
          A Yumekai és partnerei nem vállalnak felelősséget semmilyen olyan
          kárért, amely az oldal használatából, vagy a használat
          ellehetetlenüléséből ered (beleértve, de nem kizárólagosan:
          adatvesztés, üzleti kiesés vagy bevételkiesés).
        </p>
      </section>

      <div className="mt-12 text-center">
        <Button asChild>
          <Link href="/">Vissza a főoldalra</Link>
        </Button>
      </div>
    </>
  );
}
