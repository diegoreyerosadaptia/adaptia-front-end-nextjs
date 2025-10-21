"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-white backdrop-blur-sm border-b border-adaptia-gray-light/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <Image
                src="/adaptia-logo.png"
                alt="Adaptia"
                width={120}
                height={40}
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="#como-funciona"
                className="text-adaptia-blue-primary hover:text-adaptia-green-primary transition-all duration-300 relative group font-heading"
              >
                ¿Cómo funciona?
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-adaptia-green-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#que-incluye"
                className="text-adaptia-blue-primary hover:text-adaptia-green-primary transition-all duration-300 relative group font-heading"
              >
                ¿Qué incluye?
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-adaptia-green-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#por-que-adaptia"
                className="text-adaptia-blue-primary hover:text-adaptia-green-primary transition-all duration-300 relative group font-heading"
              >
                ¿Por qué Adaptia?
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-adaptia-green-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/equipo"
                className="text-adaptia-blue-primary hover:text-adaptia-green-primary transition-all duration-300 relative group font-heading"
              >
                Equipo
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-adaptia-green-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/faq"
                className="text-adaptia-blue-primary hover:text-adaptia-green-primary transition-all duration-300 relative group font-heading"
              >
                FAQ
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-adaptia-green-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="border-adaptia-blue-primary text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white bg-transparent"
            >
              <Link href="/auth/login">
                <User className="mr-2 h-4 w-4" />
                Sección Clientes
              </Link>
            </Button>
            <Button
              asChild
              className="bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white transition-all duration-300"
            >
              <Link href="/formulario">Solicitar análisis</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link href="#como-funciona" className="block px-3 py-2 text-foreground hover:text-primary">
                ¿Cómo funciona?
              </Link>
              <Link href="#que-incluye" className="block px-3 py-2 text-foreground hover:text-primary">
                ¿Qué incluye?
              </Link>
              <Link href="#por-que-adaptia" className="block px-3 py-2 text-foreground hover:text-primary">
                ¿Por qué Adaptia?
              </Link>
              <Link href="/equipo" className="block px-3 py-2 text-foreground hover:text-primary">
                Equipo
              </Link>
              <Link href="/faq" className="block px-3 py-2 text-foreground hover:text-primary">
                FAQ
              </Link>
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
                <Button asChild className="w-full bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white">
                  <Link href="/formulario">Solicitar análisis</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
