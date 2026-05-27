"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/70 backdrop-blur-md transition-colors">
      <div className=" flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Branding & Desktop Links */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900">
              AeroData
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    isActive(item.href)
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-muted-foreground hover:bg-zinc-50 hover:text-zinc-950"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Auth Profile Dropdown or Login Buttons */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full outline-none hover:bg-zinc-100 transition-colors cursor-pointer">
                    <Avatar className="h-8 w-8 ring-2 ring-emerald-500/20">
                      <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || "User Profile"} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-semibold">
                        {user?.name?.slice(0, 2).toUpperCase() || "US"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:inline" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-1.5" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-zinc-900">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-rose-600 focus:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-colors" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
          {isAuthenticated ? (
            <nav className="flex flex-col gap-1.5">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-md text-sm font-semibold transition-colors",
                    isActive(item.href)
                      ? "bg-zinc-100 text-zinc-955"
                      : "text-muted-foreground hover:bg-zinc-50 hover:text-zinc-955"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <DropdownMenuSeparator className="my-2" />
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center w-full px-3 py-2.5 rounded-md text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </nav>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
