import { useState } from "react";
import { useRestaurants } from "@/hooks/use-restaurants";
import { RestaurantCard, RestaurantCardSkeleton } from "@/components/RestaurantCard";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, SlidersHorizontal, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

const FILTERS = ["Fast Delivery", "Rating 4.0+", "Offers", "Pure Veg"];

export default function Home() {
  const { data: restaurants, isLoading, error } = useRestaurants();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredRestaurants = restaurants?.filter((r) => {
    if (activeFilters.includes("Rating 4.0+") && Number(r.rating) < 4.0) return false;
    // Pure Veg implies we'd check their tags, for mock purposes we'll say rating > 4.5 is veg to show filtering
    if (activeFilters.includes("Pure Veg") && !r.cuisine.toLowerCase().includes("indian")) return false;
    if (activeFilters.includes("Fast Delivery") && parseInt(r.deliveryTime) > 30) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Delivering to</span>
              <span className="text-foreground underline decoration-dashed decoration-primary/50 underline-offset-4">San Francisco, CA</span>
            </div>
            <h1 className="font-display text-4xl font-black md:text-5xl lg:text-6xl text-foreground">
              What are you <br className="hidden md:block"/>
              <span className="text-primary">craving</span> today?
            </h1>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mb-10 flex flex-wrap items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-full px-5 hover:bg-primary hover:text-primary-foreground hover:border-primary border-border">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              className={`rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all ${
                activeFilters.includes(f)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-transparent text-foreground hover:border-foreground/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Restaurants Grid */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Top restaurants near you</h2>
        </div>

        {error ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-destructive/10 p-8 text-center text-destructive">
            <p className="font-bold text-lg">Oops! Something went wrong.</p>
            <p className="text-sm">We couldn't fetch the restaurants at this moment.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <RestaurantCardSkeleton />
                    </motion.div>
                  ))
                : filteredRestaurants?.map((restaurant) => (
                    <motion.div
                      key={restaurant.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RestaurantCard restaurant={restaurant} />
                    </motion.div>
                  ))}
            </AnimatePresence>
          </motion.div>
        )}
        
        {!isLoading && filteredRestaurants?.length === 0 && (
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
