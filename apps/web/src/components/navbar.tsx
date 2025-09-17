"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

import { WalletConnectButton } from "./connect-button";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Savings", href: "/savings" },
  { name: "Profile", href: "/profile" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:w-80">
              <div className="flex items-center gap-2 mb-8">
                <span className="font-bold text-lg">Safelock</span>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 text-base font-medium transition-colors hover:text-primary ${
                      pathname === link.href
                        ? "text-foreground"
                        : "text-foreground/70"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="mt-6 pt-6 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  <div className="w-full">
                    <WalletConnectButton />
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <span className="hidden font-bold text-xl sm:inline-block">
              Safelock
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-foreground"
                  : "text-foreground/70"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="flex items-center gap-2 lg:gap-3">
            <ThemeToggle />
            <WalletConnectButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
