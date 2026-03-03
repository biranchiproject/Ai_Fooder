import { useState, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useAllMenuItems } from "@/hooks/use-restaurants";
import { MenuItemCard, MenuItemCardSkeleton } from "@/components/MenuItemCard";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, SlidersHorizontal, MapPin, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FilterPanel } from "@/components/FilterPanel";
import { AIPromoBanner } from "@/components/AIPromoBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LocationSelector } from "@/components/LocationSelector";
import { cn } from "@/lib/utils";

import { useLocation as useGlobalLocation } from "@/context/LocationContext";

const FILTERS = ["Veg", "Non-Veg", "Fast Delivery", "Rating 4.0+", "Offers", "Pure Veg"];

const CATEGORIES = [
  { name: "Odia Special", type: "odia-special", image: "/assets/food/odia-special/pakhala.png" },
  { name: "Biryani", type: "biryani", image: "/assets/food/biryani/hyderabadi.png" },
  { name: "Ice Cream", type: "ice-cream", image: "/assets/food/ice-cream/vanilla-ice-cream.png" },
  { name: "Cold Drinks", type: "cold-drinks", image: "/assets/food/cold-drinks/coca-cola.png" },
  { name: "North Indian", type: "north-indian", image: "/assets/food/north-indian/main.png" },
  { name: "South Indian", type: "south-indian", image: "/assets/food/south-indian/main.png" },
  { name: "Chinese", type: "chinese", image: "/assets/food/chinese/main.png" },
  { name: "Sweets", type: "sweets", image: "/assets/food/sweets/rasagola.png" },
  { name: "Beverages", type: "beverages", image: "/assets/food/beverages/main.png" },
  { name: "Fast Food", type: "fast-food", image: "/assets/food/fast-food/main.png" },
];

export default function Home() {
  const { data: allMenuItems, isLoading, error } = useAllMenuItems();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const { location } = useGlobalLocation();
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => {
      let next = [...prev];
      if (next.includes(filter)) {
        next = next.filter(f => f !== filter);
      } else {
        // Exclusive logic for Veg group
        if (filter === "Veg") next = next.filter(f => f !== "Non-Veg" && f !== "Pure Veg");
        if (filter === "Non-Veg") next = next.filter(f => f !== "Veg" && f !== "Pure Veg");
        if (filter === "Pure Veg") next = next.filter(f => f !== "Veg" && f !== "Non-Veg");
        next.push(filter);
      }
      return next;
    });
  };

  const filteredItems = useMemo(() => {
    if (!allMenuItems) return [];

    let items = [...allMenuItems];

    // Veg/Non-Veg Filter Logic
    if (activeFilters.includes("Veg") || activeFilters.includes("Pure Veg")) {
      items = items.filter(i => i.isVeg);
    } else if (activeFilters.includes("Non-Veg")) {
      items = items.filter(i => !i.isVeg);
    }

    if (activeFilters.includes("Rating 4.0+")) {
      items = items.filter(i => Number(i.restaurant?.rating || 0) >= 4.0);
    }

    // Category filtering from quick actions
    const categoryFilters = activeFilters.filter(f => !FILTERS.includes(f) && f !== "Pure Veg");
    if (categoryFilters.length > 0) {
      items = items.filter(i => categoryFilters.some(cf =>
        i.category?.toLowerCase().includes(cf.toLowerCase()) ||
        i.cuisineType?.toLowerCase().includes(cf.toLowerCase())
      ));
    }

    // Prioritize user's requested categories
    const priorityCategories = ["Odia Special", "Sweets", "Biryani"];

    // Sort logic to bring priority categories to the top, and randomize within
    items.sort((a, b) => {
      const aPrior = priorityCategories.includes(a.category) ? 1 : 0;
      const bPrior = priorityCategories.includes(b.category) ? 1 : 0;
      if (bPrior !== aPrior) {
        return bPrior - aPrior;
      }
      return 0; // maintain original relative order or could use Math.random() - 0.5
    });

    return items;
  }, [allMenuItems, activeFilters]);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Welcome Section */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-4 mb-8"
          >
            <Dialog open={isLocationOpen} onOpenChange={setIsLocationOpen}>
              <DialogTrigger asChild>
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-[1.25rem] bg-secondary/30 border border-border/50 backdrop-blur-xl shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] leading-none mb-1 font-display">Delivering To</span>
                    <span className="text-[13px] font-black text-foreground tracking-tight leading-none">
                      {location.address?.split(',')[0] || location.city}
                    </span>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border/50 p-6 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Change Location</DialogTitle>
                </DialogHeader>
                <LocationSelector onClose={() => setIsLocationOpen(false)} />
              </DialogContent>
            </Dialog>

            <div className="hidden sm:block h-6 w-px bg-border/50" />

            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/80">
              <span className="truncate max-w-[300px]">
                {location.formatted_address || `${location.city}, ${location.pinCode}`}
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display text-3xl font-bold text-foreground mb-6"
          >
            Inspiration for your first order
          </motion.h2>
        </div>

        {/* Category Inspiration - Auto Scrolling Marquee */}
        <style>{`
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div className="mb-8 md:mb-12 overflow-hidden pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            className="flex gap-4 sm:gap-6 md:gap-8 w-max"
            style={{ animation: "marquee-scroll 30s linear infinite" }}
            onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
            onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
          >
            {[...CATEGORIES, ...CATEGORIES].map((cat, index) => (
              <motion.button
                key={`${cat.name}-${index}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocation(`/category/${cat.type}`)}
                className="flex flex-col items-center gap-2 sm:gap-3 w-[76px] sm:w-[90px] md:w-[120px] shrink-0 group outline-none"
              >
                <div className="h-[76px] w-[76px] sm:h-[90px] sm:w-[90px] md:h-[120px] md:w-[120px] overflow-hidden rounded-full shadow-sm bg-secondary transition-all group-hover:shadow-md">
                  <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <span className="text-[11px] sm:text-[13px] md:text-[15px] font-semibold tracking-tight transition-colors text-foreground text-center group-hover:text-primary leading-tight">
                  {cat.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* AI Promotion Banner */}
        <AIPromoBanner />

        {/* Quick Category Action Bar */}
        <div className="mb-8 overflow-x-auto no-scrollbar pb-2 pt-2">
          <div className="flex items-center gap-3 w-max">
            {[
              { label: "Veg Only", value: "Veg", icon: "🌱" },
              { label: "Biryani", value: "Biryani", icon: "🍛" },
              { label: "Pizza", value: "Pizza & Italian", icon: "🍕" },
              { label: "Chicken", value: "Chicken", icon: "🍗" },
              { label: "Burgers", value: "Burgers", icon: "🍔" },
              { label: "Cold Drinks", value: "Cold Drinks", icon: "🥤" },
              { label: "Desserts", value: "Ice Cream", icon: "🍦" },
              { label: "Sweets", value: "Sweets", icon: "🍰" },
            ].map((cat) => (
              <motion.button
                key={cat.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  toggleFilter(cat.label);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border/50 bg-secondary/30 backdrop-blur-md transition-all hover:border-primary/40 group",
                  activeFilters.includes(cat.label) ? "bg-primary/20 border-primary shadow-[0_0_15px_-5px_rgba(var(--primary),0.3)]" : ""
                )}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-black whitespace-nowrap tracking-tight">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Extra Zomato Sections (Top Brands - Mockup representation) */}
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-display text-3xl font-bold text-foreground mb-6"
          >
            Top brands for you
          </motion.h2>

          {/* Filters styling matches Zomato pills exactly */}
          <div className="mb-10 flex flex-wrap items-center gap-3 sticky top-[80px] bg-background/95 backdrop-blur-md z-30 py-4 shadow-[0_10px_10px_-10px_rgba(0,0,0,0.05)]">
            <FilterPanel
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
              categories={CATEGORIES}
            />
            {activeFilters.map((f) => (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className="flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-3 py-1.5 text-[13px] font-semibold text-primary transition-all hover:bg-primary/10 shadow-sm"
              >
                {f}
                <X className="h-3.5 w-3.5" onClick={(e) => { e.stopPropagation(); toggleFilter(f); }} />
              </button>
            ))}
          </div>
        </div>

        {/* Top Dishes Grid */}
        <div className="mb-8 flex items-center justify-between">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display text-2xl font-bold"
          >
            Top dishes near you
          </motion.h2>
        </div>

        {error ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-destructive/10 p-8 text-center text-destructive">
            <p className="font-bold text-lg">Oops! Something went wrong.</p>
            <p className="text-sm">We couldn't fetch the food items at this moment.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <MenuItemCardSkeleton />
                  </motion.div>
                ))
                : filteredItems?.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MenuItemCard item={item} restaurantId={item.restaurantId} />
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!isLoading && filteredItems?.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Filter className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-foreground">No matches found</h3>
            <p className="mt-2 text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
            <Button variant="outline" className="mt-6" onClick={() => setActiveFilters([])}>
              Clear all filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
