// src/app/about/page.tsx
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto max-w-4xl px-4", className)} {...props} />;
}

function Section({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-6", className)} {...props} />;
}

const headingLevels = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

type HeadingLevel = keyof typeof headingLevels;

function Heading({
  level = 2,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel;
}) {
  const Tag = headingLevels[level] ?? "h2";
  return (
    <Tag
      className={cn(
        "scroll-m-20 text-2xl font-bold tracking-tight",
        level === 1 && "text-3xl",
        className
      )}
      {...props}
    />
  );
}

function Text({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-4", className)}
      {...props}
    />
  );
}

export default function AboutPage() {
  return (
    <Container className="py-10 text-foreground">
      <Section className="text-center">
        <Heading level={1} className="mb-2">
          Yumekai – A kreativitás jövője
        </Heading>
        <Text className="text-xl text-muted-foreground">
          Ahol a mesterséges intelligencia és a művészet találkozik.
        </Text>
      </Section>

      <Separator className="my-8" />

      <Section>
        <Heading level={2} className="mb-4">
          Küldetésünk
        </Heading>
        <Text>
          A Yumekai célja, hogy egy olyan platformot hozzon létre, ahol a
          kreatív alkotók – zenészek, képzőművészek, fotósok, írók és fejlesztők
          – szabadon kifejezhetik magukat, miközben modern AI technológiák
          segítik őket az alkotásban. A közösség és az innováció nálunk kéz a
          kézben járnak.
        </Text>
      </Section>

      <Section>
        <Heading level={2} className="mb-4">
          Mit kínálunk?
        </Heading>
        <ul className="list-disc space-y-2 pl-6">
          <li>🎵 Zene feltöltés, lejátszás, waveform vizualizáció</li>
          <li>🖼️ Képek, alkotások, AI által generált tartalmak kezelése</li>
          <li>💬 Prompt alapú generálás és inspiráció</li>
          <li>🎮 Saját fiók, statisztikák, kreditrendszer</li>
          <li>🌐 Teljesen online, mobilbarát felület</li>
        </ul>
      </Section>

      <Section>
        <Heading level={2} className="mb-4">
          Technológia
        </Heading>
        <Text>
          A Yumekai a HSWLP platformon alapul, amely Cloudflare Workers, R2, D1
          és KV technológiákat használ a maximális sebesség, biztonság és
          skálázhatóság érdekében. A rendszer teljesen statikus, edge-alapú,
          globálisan elérhető infrastruktúrával.
        </Text>
      </Section>

      <Section>
        <Heading level={2} className="mb-4">
          Kiknek szól?
        </Heading>
        <ul className="list-disc space-y-2 pl-6">
          <li>AI-rajongóknak, akik szívesen játszanak képgenerálással</li>
          <li>
            Zenészeknek, akik hangmintákat vagy teljes zenéket szeretnének
            megosztani
          </li>
          <li>
            Kreatív alkotóknak, akik a saját portfóliójukat szeretnék publikálni
          </li>
          <li>
            Fejlesztőknek, akik szeretnének saját SaaS appot indítani a jövőben
          </li>
        </ul>
      </Section>

      <Section>
        <Heading level={2} className="mb-4">
          Kapcsolat
        </Heading>
        <Text>
          Ha kérdésed van, vagy együttműködnél velünk, írj az alábbi email
          címre:
        </Text>
        <Text className="font-medium">📧 hello@yumekai.hu</Text>
      </Section>

      <Separator className="my-8" />

      <Section className="text-center">
        <Heading level={2}>Yumekai – Ne csak álmodj. Alkoss.</Heading>
      </Section>
    </Container>
  );
}
