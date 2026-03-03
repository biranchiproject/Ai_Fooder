import { Link, useLocation as useWouterLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/hooks/use-theme";
import { ShoppingBag, Moon, Sun, Menu, Search, User, LogOut, History, UserCircle, ChevronDown, MapPin, Palette, Shield, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { useState, useEffect, useRef, useCallback } from "react";

export function Navbar() {
  const { totalItems } = useCart();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const { location } = useLocation();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [, navigate] = useWouterLocation();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [allItems, setAllItems] = useState<any[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load data once when user focuses the search bar
  const loadSearchData = useCallback(async () => {
    if (dataLoaded) return;
    try {
      const [itemsRes, restsRes] = await Promise.all([
        fetch("/api/food").then(r => r.json()),
        fetch("/api/restaurants").then(r => r.json()),
      ]);
      setAllItems(itemsRes || []);
      setAllRestaurants(restsRes || []);
      setDataLoaded(true);
    } catch (e) {
      console.error("Failed to load search data:", e);
    }
  }, [dataLoaded]);

  // Client-side filtering
  const filteredItems = searchQuery.trim().length >= 2
    ? allItems.filter((item: any) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8)
    : [];

  const filteredRestaurants = searchQuery.trim().length >= 2
    ? allRestaurants.filter((rest: any) =>
      rest.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
    : [];

  const totalResults = filteredItems.length + filteredRestaurants.length;

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleResultClick = (path: string) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(path);
  };

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
              <button className="flex h-full items-center gap-3 px-6 hover:bg-accent/60 transition-all border-r border-border/50 group min-w-[240px]">
                <div className="relative">
                  <MapPin className="h-5 w-5 text-primary shrink-0 transition-transform group-hover:scale-110" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse border-2 border-background" />
                </div>
                <div className="flex flex-col items-start overflow-hidden flex-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] leading-none mb-1">Delivering To</span>
                  <div className="flex items-center gap-1 w-full mt-0.5">
                    <span className="text-[13px] font-black truncate text-foreground leading-none tracking-tight">
                      {location.address?.split(',')[0] || location.city}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto shrink-0 transition-transform group-hover:translate-y-0.5" />
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

          <div ref={searchRef} className="relative flex-1 h-full flex items-center bg-background">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length >= 2) setShowResults(true);
                else setShowResults(false);
              }}
              onFocus={() => {
                loadSearchData();
                if (searchQuery.trim().length >= 2) setShowResults(true);
              }}
              onKeyDown={(e) => e.key === "Escape" && setShowResults(false)}
              placeholder="Search for restaurant, cuisine or a dish"
              className="h-full w-full bg-transparent px-12 text-base text-foreground placeholder:text-muted-foreground outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setShowResults(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border/50 bg-background/98 backdrop-blur-xl shadow-2xl overflow-hidden z-[100] max-h-[70vh] overflow-y-auto"
                >
                  {totalResults === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground font-medium">No results for "{searchQuery}"</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">Try a different keyword</p>
                    </div>
                  ) : (
                    <>
                      {/* Restaurant Results */}
                      {filteredRestaurants.length > 0 && (
                        <div className="p-3">
                          <p className="px-3 pb-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">Restaurants</p>
                          {filteredRestaurants.map((rest: any) => (
                            <button
                              key={`r-${rest.id}`}
                              onClick={() => handleResultClick(`/restaurant/${rest.id}`)}
                              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-accent/60 transition-colors text-left"
                            >
                              <div className="h-11 w-11 rounded-full overflow-hidden bg-secondary shrink-0">
                                <img
                                  src={rest.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&q=60"}
                                  alt={rest.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&q=60"; }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground truncate">{rest.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{rest.cuisine} • ⭐ {rest.rating} • {rest.delivery_time}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Divider */}
                      {filteredRestaurants.length > 0 && filteredItems.length > 0 && (
                        <div className="mx-4 border-t border-border/30" />
                      )}

                      {/* Food Item Results */}
                      {filteredItems.length > 0 && (
                        <div className="p-3">
                          <p className="px-3 pb-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">Dishes</p>
                          {filteredItems.map((item: any) => (
                            <button
                              key={`i-${item.id}`}
                              onClick={() => handleResultClick(`/restaurant/${item.restaurantId}`)}
                              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-accent/60 transition-colors text-left"
                            >
                              <div className="h-11 w-11 rounded-xl overflow-hidden bg-secondary shrink-0">
                                <img
                                  src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=60"}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=60"; }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                              </div>
                              <span className="text-sm font-bold text-primary shrink-0">₹{((item.price || 0) / 100).toFixed(0)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
                  <Link href="/profile">
                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl focus:bg-accent cursor-pointer">
                      <UserCircle className="h-5 w-5 text-primary" />
                      <span className="font-bold">Your Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/orders">
                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl focus:bg-accent cursor-pointer">
                      <History className="h-5 w-5 text-primary" />
                      <span className="font-bold">Order History</span>
                    </DropdownMenuItem>
                  </Link>
                  {(user.role === "superadmin" || user.role === "admin") && (
                    <Link href="/superadmin">
                      <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl focus:bg-accent cursor-pointer text-purple-400 focus:text-purple-300">
                        <Shield className="h-5 w-5" />
                        <span className="font-bold">{user.role === "superadmin" ? "SuperAdmin Dashboard" : "Admin Dashboard"}</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
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
