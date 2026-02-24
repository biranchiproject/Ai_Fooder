import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/hooks/use-theme";
import { ShoppingBag, Moon, Sun, Menu, Search, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Mobile Menu + Logo */}
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 -ml-2 text-foreground hover:bg-accent rounded-full transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <span className="font-display text-xl font-black">Z</span>
            </div>
            <span className="hidden font-display text-2xl font-black tracking-tight text-foreground sm:inline-block">
              Cravez
            </span>
          </Link>
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden max-w-md flex-1 md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" />
            <input
              type="text"
              placeholder="Search for restaurants, cuisine or a dish"
              className="h-12 w-full rounded-2xl border-2 border-transparent bg-secondary px-10 py-2 text-base text-foreground placeholder-muted-foreground outline-none transition-all hover:border-border focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <User className="h-5 w-5" />
          </button>

          <Link href="/cart" className="relative flex h-11 items-center justify-center gap-2 rounded-full bg-secondary px-4 text-foreground transition-colors hover:bg-accent active:scale-95 sm:rounded-2xl">
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden font-semibold sm:inline-block">Cart</span>
            {totalItems > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-bold text-primary-foreground shadow-sm"
              >
                {totalItems}
              </motion.div>
            )}
          </Link>
        </div>

      </div>
    </header>
  );
}
