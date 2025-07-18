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
  onActivate?: () => void
}

// Dummy helper functions for onActivate logic
const highlightPost = () => console.log('highlightPost called')

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
  },
  {
    id: 'highlight-post',
    name: 'Poszt kiemelés',
    description: 'A kiválasztott poszt kiemelten jelenik meg 24 órán keresztül.',
    credits: 50,
    preview: () => <div className="h-12 w-24 bg-yellow-200 rounded" />,
    onActivate: () => {
      localStorage.setItem('highlight_active', '1')
      highlightPost()
    }
  },
  {
    id: 'profile-frame',
    name: 'Színes profilkeret',
    description: 'Látható, színes profilkeret a kiemelt felhasználóknak.',
    credits: 100,
    preview: () => <div className="h-12 w-12 rounded-full border-4 border-pink-500" />,
    onActivate: () => {
      localStorage.setItem('profile_frame', '1')
    }
  },
  {
    id: 'custom-avatar',
    name: 'Egyedi profil ikon (3 változat)',
    description: 'Választható egyedi avatar ikon szettek közül.',
    credits: 150,
    preview: () => <div className="h-12 w-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />,
    onActivate: () => {
      localStorage.setItem('custom_avatar', 'unlocked')
    }
  },
  {
    id: 'pin-post',
    name: 'Poszt fixálás',
    description: 'A kiválasztott poszt rögzítésre kerül a feed tetejére.',
    credits: 200,
    preview: () => <div className="h-8 w-8 bg-blue-300 rounded-full" />,
    onActivate: () => {
      localStorage.setItem('pin_enabled', '1')
    }
  },
  {
    id: 'emoji-reactions',
    name: 'Emoji reakciók kommentekhez',
    description: 'Lehetővé teszi, hogy emoji reakciókat adj mások kommentjeihez.',
    credits: 80,
    preview: () => <div className="text-2xl">😀</div>,
    onActivate: () => {
      localStorage.setItem('emoji_reactions', 'enabled')
    }
  },
  {
    id: 'daily-surprise',
    name: 'Napi meglepetés',
    description: 'Véletlenszerűen kapsz egy kis extrát: pl. kis keret, 10 pont vagy ritkán badge.',
    credits: 60,
    preview: () => <div className="h-8 w-20 bg-green-200 rounded" />,
    onActivate: () => {
      const rewards = [
        () => localStorage.setItem('bonus_frame', '1'),
        () => localStorage.setItem('bonus_points', '10'),
        () => localStorage.setItem('bonus_badge', '1')
      ]
      const rand = Math.floor(Math.random() * rewards.length)
      rewards[rand]()
    }
  }
]
