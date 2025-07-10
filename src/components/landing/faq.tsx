import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GITHUB_REPO_URL } from "@/constants";

const faqs = [
  {
    question: "Valóban ingyenes ez a sablon?",
    answer: (
      <>
        Igen, a sablon teljesen ingyenes és <a href={GITHUB_REPO_URL} target="_blank">nyílt forráskódú</a>! Szabadon használhatod személyes és kereskedelmi projektekben, módosíthatod és terjesztheted mindenféle megkötés nélkül.
      </>
    ),
  },
  {
    question: "Milyen funkciók találhatók meg a sablonban?",
    answer: (
      <>
        A sablon átfogó funkciókészlettel rendelkezik:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Authentication with email/password and forgot password flow</li>
          <li>Database integration with Drizzle ORM and Cloudflare D1</li>
          <li>Email service powered by React Email and Resend</li>
          <li>Modern UI components from Shadcn UI and Tailwind CSS</li>
          <li>Form validations and error handling</li>
          <li>Dark mode support</li>
          <li>Responsive design</li>
          <li>TypeScript throughout the codebase</li>
          <li>Automated deployments with GitHub Actions</li>
          <li>Captcha integration with Turnstile</li>
          <li>SEO optimization with Next.js</li>
          <li>És még rengeteg egyéb funkció...</li>
        </ul>
      </>
    ),
  },
  {
    question: "Milyen technológiákra épül a rendszer?",
    answer: (
      <>
        <p>A sablon modern és megbízható technológiákat használ:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Next.js 15 with App Router and React Server Components</li>
          <li>TypeScript for type safety</li>
          <li>Tailwind CSS and Shadcn UI for styling</li>
          <li>DrizzleORM with Cloudflare D1 for database</li>
          <li>Lucia Auth for authentication</li>
          <li>Cloudflare Workers for serverless deployment</li>
          <li>Cloudflare KV for session storage</li>
          <li>React Email a szép e-mail sablonokért</li>
        </ul>
      </>
    ),
  },
  {
    question: "Hogyan telepíthetem az alkalmazást?",
    answer: (
      <>
        <p>A telepítés GitHub Actions segítségével automatizált. A következőkre lesz szükséged:</p>
        <ol className="list-decimal pl-6 mt-2 space-y-1">
          <li>Create Cloudflare D1 and KV namespaces</li>
          <li>Set up Resend for email service</li>
          <li>Configure Turnstile for captcha</li>
          <li>Add your Cloudflare API token to GitHub secrets</li>
          <li>Push to the main branch</li>
        </ol>
        <p className="mt-2">A telepítési folyamat teljes egészében dokumentálva van a <a href={`${GITHUB_REPO_URL}/blob/main/README.md`} target="_blank">GitHub repóban</a>.</p>
      </>
    ),
  },
  {
    question: "Mire van szükség a kezdéshez?",
    answer: (
      <>
        <p>Csak egy Cloudflare fiók (a free csomag is elegendő), helyben telepített Node.js és alap React illetve TypeScript ismeret kell. A sablon részletes dokumentációval segít a beállításban.</p>
        <p>További információért nézd meg a <a href={`${GITHUB_REPO_URL}/blob/main/README.md`} target="_blank">dokumentációt</a>.</p>
      </>
    ),
  },
  {
    question: "Milyen újdonságok várhatók?",
    answer: (
      <>
        <p>Izgalmas fejlesztések vannak tervben:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Multi-language support (i18n)</li>
          <li>Billing and payment processing</li>
          <li>Admin dashboard</li>
          <li>Email verification on sign up</li>
          <li>Notifications system</li>
          <li>Webhooks support</li>
          <li>Team collaboration features</li>
          <li>Real-time updates</li>
          <li>Analytics dashboard</li>
        </ul>
      </>
    ),
  },
  {
    question: "Meg tudom nézni előre az email sablonokat?",
    answer: (
      <>
        Igen! Futtasd a <code>pnpm email:dev</code> parancsot, majd nyisd meg a <a href="http://localhost:3001" target="_blank">http://localhost:3001</a> címet, ahol szerkesztheted és előnézheted a sablonokat.
      </>
    ),
  },
  {
    question: "Hogyan tudom testre szabni a sablont?",
    answer: (
      <>
        <p>A végleges élesítés előtt érdemes:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Update project details in <code>src/constants.ts</code></li>
          <li>Customize the documentation in <code>./cursor-docs</code></li>
          <li>Modify the footer in <code>src/components/footer.tsx</code></li>
          <li>Optionally update the color palette in <code>src/app/globals.css</code></li>
        </ul>
      </>
    ),
  },
  {
    question: "Hogyan tudok hozzájárulni?",
    answer: (
      <>
        Szívesen fogadunk minden közreműködést! Nyiss hibajegyet, küldj pull requestet vagy segíts a dokumentáció fejlesztésében a <a href={GITHUB_REPO_URL} target="_blank">GitHubon</a>.
      </>
    ),
  },
];

export function FAQ() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10 dark:divide-gray-100/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight">
            Gyakran ismételt kérdések
          </h2>
          <Accordion type="single" collapsible className="w-full mt-10">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose dark:prose-invert w-full max-w-none">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
