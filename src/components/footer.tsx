import Link from "next/link"
import ThemeSwitch from "@/components/theme-switch"
import { SITE_NAME } from "@/constants"
import { Github, Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t dark:bg-muted/30 bg-muted/60 shadow-inner backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
            {/* Legal section */}
            <div className="space-y-3 md:space-y-4 flex flex-col items-center md:items-start">
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company info */}
            <div className="space-y-3 md:space-y-4 flex flex-col items-center md:items-start">
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="https://hswlp.com" className="hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/hswlp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 pt-6 md:mt-8 md:pt-8 border-t border-border/60">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
              </p>

              <p className="text-xs text-muted-foreground text-center md:text-left max-w-md">
                Yumekai does not allow requests or sharing of erotic, sexual or violent content. All such attempts are logged.
              </p>

              <div className="flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <ThemeSwitch />
                <a
                  href="https://promnet.hu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1 font-medium text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="transition-all group-hover:translate-x-[2px]">Created by</span>
                  <span className="font-semibold text-primary transition-all group-hover:scale-105">HSWLP Team</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
