import { Boxes } from "lucide-react"
import { TeamSwitcher } from "@/components/team-switcher"
import ThemeSwitch from "@/components/theme-switch"
import SeparatorWithText from "@/components/separator-with-text"
import { NavUser } from "@/components/nav-user"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"

interface MarketplaceComponent {
  id: string
  name: string
  description: string
  credits: number
  containerClass?: string
  preview: () => React.ReactNode
}

interface Team {
  name: string
  iconName: string
  plan: string
}

const demoTeams: Team[] = [
  {
    name: "Acme Inc",
    iconName: "boxes",
    plan: "Pro Plan",
  },
  {
    name: "Monsters Inc",
    iconName: "boxes",
    plan: "Free Plan",
  },
]

export const COMPONENTS: MarketplaceComponent[] = [
  {
    id: "team-switcher",
    name: "Csapatváltó modul",
    description: "Gyors csapatválasztó lenyíló menü saját logóval és csomaggal",
    credits: 4,
    containerClass: "w-[300px]",
    preview: () => {
      const teams = demoTeams.map(team => ({
        ...team,
        logo: Boxes,
      }))
      return <TeamSwitcher teams={teams} />
    },
  },
  {
    id: "theme-switch",
    name: "Téma váltó",
    description: "Animált sötét/világos mód kapcsoló",
    credits: 4,
    preview: () => <ThemeSwitch />,
  },
  {
    id: "separator-with-text",
    name: "Szöveges elválasztó",
    description: "Egyszerű vonal szöveggel, testre szabható stílussal",
    credits: 3,
    containerClass: "w-full",
    preview: () => (
      <SeparatorWithText>
        <span className="text-muted-foreground">OR</span>
      </SeparatorWithText>
    ),
  },
  {
    id: "nav-user",
    name: "Felhasználói menü",
    description: "Avatarral és műveletekkel ellátott felhasználói menü",
    credits: 10,
    containerClass: "w-[300px]",
    preview: () => <NavUser />,
  },
  {
    id: "page-header",
    name: "Oldal fejléce",
    description: "Reszponzív fejléc összehajtható oldalsávval és kenyérmorzsákkal",
    credits: 12,
    containerClass: "w-full",
    preview: () => (
      <PageHeader
        items={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/settings", label: "Settings" },
        ]}
      />
    ),
  },
  {
    id: 'button',
    name: "Gomb",
    description: "Stílusos gomb komponens egyedi felirattal",
    credits: 8,
    containerClass: "w-full flex justify-center",
    preview: () => <Button>Click me</Button>,
  }
]
