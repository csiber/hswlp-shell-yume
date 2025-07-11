import Link from "next/link";
import { SiX as XIcon } from "@icons-pack/react-simple-icons";
import ThemeSwitch from "@/components/theme-switch";
import { SITE_NAME } from "@/constants";

export function Footer() {
  return (
    <footer className="border-t dark:bg-muted/30 bg-muted/60 shadow">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
            {/* Jogi rész */}
            <div className="space-y-3 md:space-y-4 flex flex-col items-center md:items-start">
              <h3 className="text-sm font-semibold text-foreground">Jogi</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Felhasználási feltételek
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Adatkezelési tájékoztató
                  </Link>
                </li>
              </ul>
            </div>

            {/* Céginfó */}
            <div className="space-y-3 md:space-y-4 flex flex-col items-center md:items-start">
              <h3 className="text-sm font-semibold text-foreground">Cég</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Főoldal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Közösségi ikonok és theme */}
            <div className="space-y-3 md:space-y-4 flex flex-col items-center md:items-start">
              <h3 className="text-sm font-semibold text-foreground">
                Közösség
              </h3>
              <div className="flex items-center space-x-4">
                <a
                  href="https://x.com/LubomirGeorg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="h-5 w-5" />
                  <span className="sr-only">X</span>
                </a>
              </div>
            </div>
          </div>

          {/* Alsó sáv */}
          <div className="mt-6 pt-6 md:mt-8 md:pt-8 border-t">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © {new Date().getFullYear()} {SITE_NAME}. Minden jog fenntartva.
              </p>

              <div className="flex flex-col md:flex-row items-center gap-4">
                <ThemeSwitch />
                <a
                  href="https://promnet.hu"
                  target="_blank"
                  className="flex items-center font-medium text-sm hover:text-foreground transition-colors"
                >
                  <span>Készítette: </span>
                  <span>Polyák Csaba (PromNET)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
