import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Adatkezelési tájékoztató",
  description:
    "Tudd meg, hogyan kezeljük és védjük az adataidat a Yumekai rendszerben.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-4xl font-bold text-foreground mb-8">
        Adatkezelési tájékoztató
      </h1>

      <p className="text-muted-foreground mb-6">
        Utolsó frissítés: {new Date().toLocaleDateString("hu-HU")}
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          1. Milyen adatokat gyűjtünk
        </h2>
        <p className="text-muted-foreground">
          A Yumekai használata során az általad megadott adatokat gyűjtjük,
          például a nevedet, e-mail címedet, valamint minden egyéb információt,
          amit önkéntesen megosztasz velünk.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          2. Az adatok felhasználásának módja
        </h2>
        <p className="text-muted-foreground">
          Az összegyűjtött adatokat az alábbi célokra használjuk:
        </p>
        <ul className="list-disc pl-6 mt-2 text-muted-foreground">
          <li>Szolgáltatásaink működtetése, fejlesztése és fenntartása</li>
          <li>Technikai értesítések és támogatási üzenetek küldése</li>
          <li>Visszajelzések és kérdések megválaszolása</li>
          <li>
            Visszaélések, csalás vagy jogosulatlan használat elleni védelem
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          3. Adatbiztonság
        </h2>
        <p className="text-muted-foreground">
          Megfelelő technikai és szervezési intézkedéseket alkalmazunk annak
          érdekében, hogy az adataidat megvédjük elvesztéstől, illetéktelen
          hozzáféréstől, módosítástól vagy törléstől.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          4. Kapcsolatfelvétel
        </h2>
        <p className="text-muted-foreground">
          Ha kérdésed van az adatkezelési tájékoztatóval kapcsolatban, az alábbi
          elérhetőségen keresztül léphetsz velünk kapcsolatba:
          <br />
          E-mail: privacy@yumekai.hu
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
