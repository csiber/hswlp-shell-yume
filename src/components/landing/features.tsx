import {
  CloudIcon,
  BoltIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  EnvelopeIcon,
  CommandLineIcon,
  SunIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Bejelentkezésre kész",
    description:
      "Teljes hitelesítési rendszer email/jelszó belépéssel, regisztrációval, elfelejtett jelszó folyamattal és munkamenet-kezeléssel Lucia Auth segítségével.",
    icon: ShieldCheckIcon,
  },
  {
    name: "Adatbázis és e-mail",
    description:
      "Drizzle ORM és Cloudflare D1 az adatbázishoz, valamint React Email és Resend a látványos e-mail sablonokhoz.",
    icon: EnvelopeIcon,
  },
  {
    name: "Modern stack",
    description:
      "Next.js 15 App Router React Server Components-szel, Server Actions-szel és Edge Runtime-mal az optimális teljesítményért.",
    icon: BoltIcon,
  },
  {
    name: "Letisztult felület",
    description:
      "Reszponzív, sötét/világos módot támogató felület Tailwind CSS és Shadcn UI komponensekkel.",
    icon: SunIcon,
  },
  {
    name: "Edge deploy",
    description:
      "Globális deploy Cloudflare Workers segítségével, hidegindítás nélkül, kihasználva a Cloudflare edge hálózatának sebességét.",
    icon: CloudIcon,
  },
  {
    name: "Fejlesztői élmény",
    description:
      "GitHub Actions alapú deploy, részletes dokumentáció és TypeScript a típusbiztonságért.",
    icon: CommandLineIcon,
  },
  {
    name: "Űrlapkezelés",
    description:
      "Beépített űrlapvalidáció Zod és React Hook Form segítségével a gördülékeny felhasználói élményért.",
    icon: RocketLaunchIcon,
  },
  {
    name: "Csapatra felkészítve",
    description:
      "Együttműködésre tervezve, könnyen testreszabható és bővíthető a csapat igényei szerint.",
    icon: UserGroupIcon,
  },
];

export function Features() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
            Éles használatra kész
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Minden, ami egy SaaS alkalmazáshoz kell
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Teljes alapokra építünk, hogy a lényegre koncentrálhass.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <feature.icon
                    className="h-5 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
