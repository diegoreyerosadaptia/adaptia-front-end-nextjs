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
    { href: "/#como-funciona", label: "¿Cómo funciona?" },
    { href: "/#que-incluye", label: "¿Qué incluye?" },
    { href: "/#por-que-adaptia", label: "¿Por qué Adaptia?" },
    { href: "/equipo", label: "Equipo" },
    { href: "/faq", label: "FAQ" },
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
      <nav className="fixed top-0 w-full bg-white backdrop-blur-sm border-b border-adaptia-gray-light/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center group mr-8">
              <Image
                src="/adaptia-logo.png"
                alt="Adaptia"
                width={120}
                height={40}
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>

            {/* Navigation links */}
            <div className="hidden lg:flex flex-1 space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href.startsWith("#") ? pathname : link.href}
                  onClick={(e) => {
                    if (link.href.startsWith("#")) {
                      e.preventDefault()
                      handleNavClick(link.href)
                    }
                  }}
                  className={`relative group font-heading px-3 py-1 rounded-md transition-all duration-300 ${
                    isActive(link.href)
                      ? "text-adaptia-green-primary"
                      : "text-adaptia-blue-primary hover:text-adaptia-green-primary"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-adaptia-green-primary transition-all duration-300 ${
                      isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </Link>
              ))}
            </div>

            {/* Buttons aligned to the right */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <Button
                asChild
                variant="outline"
                className="border-adaptia-blue-primary text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white bg-transparent"
              >
                <Link href="/auth/login">
                  <User className="mr-2 h-2 w-2" />
                  Log-in
                </Link>
              </Button>
              <Button
                onClick={() => setIsDrawerOpen(true)}
                className="bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white transition-all duration-300"
              >
                Solicitar análisis
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden ml-auto">
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
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
                    className={`block px-3 py-2 rounded-md transition ${
                      isActive(link.href)
                        ? "text-adaptia-green-primary border-b-2 border-adaptia-green-primary"
                        : "text-adaptia-blue-primary hover:text-adaptia-green-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="px-3 py-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-adaptia-blue-primary text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white bg-transparent mb-2"
                  >
                    <Link href="/auth/login">
                      <User className="mr-2 h-4 w-4" />
                      Sección Clientes
                    </Link>
                  </Button>
                </div>
                <div className="px-3 py-2">
                  <Button
                    onClick={() => {
                      setIsDrawerOpen(true)
                      setIsOpen(false)
                    }}
                    className="w-full bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white"
                  >
                    Solicitar análisis
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Analysis Drawer Component */}
      <AnalysisDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  )
}
