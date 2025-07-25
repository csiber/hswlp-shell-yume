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
          <h1 className="text-4xl font-bold mt-4">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Purchase and use our premium products with your credits
          </p>
        </div>

        <Alert
          color="warning"
          title="How does it work?"
          description="Select a component, purchase it with your credits, then activate it to use immediately."
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
