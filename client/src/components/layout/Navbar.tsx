import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/hooks/use-theme";
import { ShoppingBag, Moon, Sun, Menu, Search, User, LogOut, History, UserCircle, ChevronDown, MapPin, Palette, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/context/LocationContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LocationSelector } from "@/components/LocationSelector";
import { useState } from "react";

export function Navbar() {
  const { totalItems } = useCart();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const { location } = useLocation();
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md shadow-sm border-b border-border/40">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-y-3 px-4 py-3 sm:px-6 lg:px-8 max-w-[1200px] md:h-20 md:py-0 md:flex-nowrap md:gap-4">

        {/* Left: Mobile Menu + Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="md:hidden p-2 -ml-2 text-foreground hover:bg-accent rounded-full transition-colors">
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex items-center">
            <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-tighter text-primary">
              Ai fooder
            </span>
          </Link>
        </div>

        {/* Right: Actions (moved up in DOM so they align right on mobile top row) */}
        <div className="flex items-center gap-2 sm:gap-6 ml-auto md:ml-0 order-2 md:order-3">
          <Dialog open={isLocationOpen} onOpenChange={setIsLocationOpen}>
            <DialogTrigger asChild>
              <button className="flex h-full items-center gap-2 px-4 hover:bg-secondary/30 transition-colors border-r border-border/50 min-w-[220px]">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <div className="flex flex-col items-start overflow-hidden flex-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location</span>
                  <div className="flex items-center gap-1 w-full mt-0.5">
                    <span className="text-sm font-semibold truncate text-foreground">
                      {location.formatted_address || `${location.city}, ${location.pinCode}`}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
                  </div>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border/50 p-6 bg-background/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Change Location</DialogTitle>
              </DialogHeader>
              <LocationSelector onClose={() => setIsLocationOpen(false)} />
            </DialogContent>
          </Dialog>

          <div className="relative flex-1 h-full flex items-center bg-background">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for restaurant, cuisine or a dish"
              className="h-full w-full bg-transparent px-12 text-base text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 md:pr-3 hover:bg-accent transition-colors outline-none">
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 border border-border/50">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                    <AvatarFallback>{(user.fullName || user.username)[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block text-base font-semibold truncate max-w-[120px] text-foreground">
                    {user.fullName || user.username}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-2 rounded-[2rem] p-3 shadow-2xl border-border/50 bg-background/95 backdrop-blur-xl">
                <DropdownMenuLabel className="font-black text-lg px-4 pt-4 pb-2">Namaste, {user.fullName || user.username}!</DropdownMenuLabel>
                <p className="px-4 pb-4 text-xs text-muted-foreground font-medium">{user.email}</p>
                <div className="p-1">
                  <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl cursor-not-allowed opacity-50 focus:bg-accent">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <span className="font-bold">Your Profile</span>
                  </DropdownMenuItem>
                  <Link href="/orders">
                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl focus:bg-accent cursor-pointer">
                      <History className="h-5 w-5 text-primary" />
                      <span className="font-bold">Order History</span>
                    </DropdownMenuItem>
                  </Link>
                  {user.role === "superadmin" && (
                    <Link href="/superadmin">
                      <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl focus:bg-accent cursor-pointer text-purple-400 focus:text-purple-300">
                        <Shield className="h-5 w-5" />
                        <span className="font-bold">SuperAdmin Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                </div>
                <DropdownMenuSeparator className="mx-2 opacity-50" />
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-3 text-sm font-black text-muted-foreground uppercase tracking-widest">
                    <Palette className="h-4 w-4" /> Themes
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setTheme("light")} className={cn("p-2 text-xs font-bold rounded-xl border transition-all", theme === "light" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border/50 hover:bg-accent hover:border-border")}>Light</button>
                    <button onClick={() => setTheme("dark")} className={cn("p-2 text-xs font-bold rounded-xl border transition-all", theme === "dark" || theme === "system" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border/50 hover:bg-accent hover:border-border")}>Dark</button>
                    <button onClick={() => setTheme("neon")} className={cn("col-span-2 p-2 text-xs font-bold rounded-xl border transition-all", theme === "neon" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border/50 hover:bg-accent hover:border-border")}>Neon Cyberpunk</button>
                    <button onClick={() => setTheme("ocean")} className={cn("p-2 text-xs font-bold rounded-xl border transition-all", theme === "ocean" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border/50 hover:bg-accent hover:border-border")}>Ocean</button>
                    <button onClick={() => setTheme("sunset")} className={cn("p-2 text-xs font-bold rounded-xl border transition-all", theme === "sunset" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border/50 hover:bg-accent hover:border-border")}>Sunset</button>
                  </div>
                </div>
                <DropdownMenuSeparator className="mx-2 opacity-50" />
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    className="flex items-center gap-3 p-3 rounded-2xl text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-bold">Logout</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-6">
              <Link href="/auth" className="text-lg font-light text-muted-foreground hover:text-foreground transition-colors">
                Log in
              </Link>
              <Link href="/auth" className="text-lg font-light text-muted-foreground hover:text-foreground transition-colors">
                Sign up
              </Link>
            </div>
          )}

          <div className="sm:hidden">
            {!user && (
              <Link href="/auth">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground rounded-full">
                  <User className="h-6 w-6" />
                </Button>
              </Link>
            )}
          </div>

          {/* Cart Button */}
          <Link href="/cart">
            <button className="relative flex h-10 w-10 md:w-auto items-center justify-center gap-2 rounded-full md:rounded-2xl md:bg-secondary/50 md:px-4 md:hover:bg-secondary transition-colors text-foreground group">
              <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="hidden md:inline font-bold">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 md:top-2 md:right-2 flex h-5 w-5 md:h-5 md:w-5 items-center justify-center rounded-full bg-primary text-[10px] md:text-xs font-bold text-primary-foreground shadow-sm ring-2 ring-background">
                  {totalItems}
                </span>
              )}
            </button>
          </Link>
        </div>

      </div>
    </header>
  );
}
