import { Alert } from "@heroui/react";
import { COMPONENTS } from "./components-catalog";
import { MarketplaceCard } from "@/components/marketplace-card";
import { getSessionFromCookie } from "@/utils/auth";
import { getUserActiveComponents } from "@/server/marketplace";

export default async function MarketplacePage() {
  const session = await getSessionFromCookie();
  const activeComponents = session ? await getUserActiveComponents(session.userId) : new Set();

  return (
    <>
      <div className="container mx-auto px-5 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mt-4">Vásártér</h1>
          <p className="text-muted-foreground mt-2">
            Vásárolj és használd prémium termékeinket kreditjeid
            felhasználásával
          </p>
        </div>

        <Alert
          color="warning"
          title="Demo funkció"
          description="Ez az oldal bemutatja, hogyan valósítható meg a kredit alapú fizetés. Saját igényeid szerint továbbfejlesztheted."
          className="mb-6"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COMPONENTS.map((component) => (
            <MarketplaceCard
              key={component.id}
              id={component.id}
              name={component.name}
              description={component.description}
              credits={component.credits}
              containerClass={component.containerClass}
              isActive={activeComponents.has(component.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
