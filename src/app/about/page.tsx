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
          Our mission
        </Heading>
        <Text>
          Yumekai aims to create a space where creative artists – musicians,
          visual artists, photographers, writers and developers – can freely
          express themselves while modern AI technologies assist them. Community
          and innovation go hand in hand here.
        </Text>
      </Section>

      <Section>
        <Heading level={2} className="mb-4">
          What we offer
        </Heading>
        <ul className="list-disc space-y-2 pl-6">
          <li>🎵 Music uploads, playback and waveform visualisation</li>
          <li>🖼️ Manage images, artwork and AI-generated content</li>
          <li>💬 Prompt-based generation and inspiration</li>
          <li>🎮 Personal accounts, statistics and credit system</li>
          <li>🌐 Fully online, mobile-friendly interface</li>
        </ul>
      </Section>

      <Section>
        <Heading level={2} className="mb-4">
          Technology
        </Heading>
        <Text>
          Yumekai is built on the HSWLP platform using Cloudflare Workers, R2,
          D1 and KV technologies for maximum speed, security and scalability. The
          system is fully static and edge-based with global availability.
        </Text>
      </Section>

      <Section>
        <Heading level={2} className="mb-4">
          Who is it for?
        </Heading>
        <ul className="list-disc space-y-2 pl-6">
          <li>AI enthusiasts who love experimenting with image generation</li>
          <li>
            Musicians looking to share samples or full tracks
          </li>
          <li>
            Creators wanting to publish their own portfolios
          </li>
          <li>
            Developers who plan to launch their own SaaS apps in the future
          </li>
        </ul>
      </Section>

      <Section>
        <Heading level={2} className="mb-4">
          Contact
        </Heading>
        <Text>
          If you have questions or want to collaborate, write to us at:
        </Text>
        <Text className="font-medium">📧 hello@yumekai.hu</Text>
      </Section>

      <Separator className="my-8" />

      <Section className="text-center">
        <Heading level={2}>Yumekai – Don&apos;t just dream. Create.</Heading>
      </Section>
    </Container>
  );
}
