"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"
import { AnalysisDrawer } from "@/components/form-org/analysis-drawer"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("")
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/equipo", label: "Equipo" },
    { href: "/faq", label: "FAQ" },
    { href: "/recurso", label: "Recursos" },
  ]

  const isActive = (href: string) => {
    if (href.startsWith("#")) return activeSection === href
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      setActiveSection(href)
      const element = document.querySelector(href)
      if (element) element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-adaptia-gray-light/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-6">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center shrink-0 group">
              <Image
                src="/adaptia-logo.png"
                alt="Adaptia"
                width={170}
                height={70}
                className="h-15 w-auto transition-transform duration-200 group-hover:scale-[1.03]"
                priority
              />
            </Link>

            {/* Center: Navigation links */}
            <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href.startsWith("#") ? pathname : link.href}
                    onClick={(e) => {
                      if (link.href.startsWith("#")) {
                        e.preventDefault()
                        handleNavClick(link.href)
                      }
                    }}
                    className={[
                      "relative px-4 py-2 rounded-full font-heading text-lg transition-all duration-200",
                      active
                        ? "text-adaptia-green-primary bg-adaptia-green-primary/10"
                        : "text-adaptia-blue-primary hover:text-adaptia-green-primary hover:bg-adaptia-green-primary/5",
                    ].join(" ")}
                  >
                    {link.label}
                    <span
                      className={[
                        "absolute left-1/2 -translate-x-1/2 -bottom-1 h-0.5 bg-adaptia-green-primary transition-all duration-200",
                        active ? "w-8" : "w-0 group-hover:w-8",
                      ].join(" ")}
                    />
                  </Link>
                )
              })}
            </div>

            {/* Right: Actions */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Button
                asChild
                variant="outline"
                className="h-10 px-4 rounded-full border-adaptia-blue-primary text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white bg-transparent"
              >
                <Link href="/auth/login" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-heading">Log-in</span>
                </Link>
              </Button>

              <Button
                onClick={() => setIsDrawerOpen(true)}
                className="h-10 px-5 rounded-full bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white font-heading shadow-md hover:shadow-lg transition-all"
              >
                Solicitar análisis
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen((v) => !v)}
                className="h-10 w-10"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden pb-4">
              <div className="mt-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="p-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href.startsWith("#") ? pathname : link.href}
                      onClick={(e) => {
                        if (link.href.startsWith("#")) {
                          e.preventDefault()
                          handleNavClick(link.href)
                        }
                        setIsOpen(false)
                      }}
                      className={[
                        "block px-4 py-3 rounded-lg font-heading text-sm transition",
                        isActive(link.href)
                          ? "text-adaptia-green-primary bg-adaptia-green-primary/10"
                          : "text-adaptia-blue-primary hover:text-adaptia-green-primary hover:bg-adaptia-green-primary/5",
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-gray-200 p-3 space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-11 rounded-full border-adaptia-blue-primary text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white bg-transparent"
                  >
                    <Link href="/auth/login" className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4" />
                      Sección Clientes
                    </Link>
                  </Button>

                  <Button
                    onClick={() => {
                      setIsDrawerOpen(true)
                      setIsOpen(false)
                    }}
                    className="w-full h-11 rounded-full bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white font-heading"
                  >
                    Solicitar análisis
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AnalysisDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  )
}
