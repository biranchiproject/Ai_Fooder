import { useRoute, Link, useLocation } from "wouter";
import { useCategoryItems } from "@/hooks/use-restaurants";
import { MenuItemCard, MenuItemCardSkeleton } from "@/components/MenuItemCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Filter, Loader2, SlidersHorizontal, Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import type { MenuItem, Restaurant } from "@shared/schema";
import { FilterPanel } from "@/components/FilterPanel";

type CategoryItem = MenuItem & { restaurant: Restaurant };

const CATEGORIES = [
    { name: "Odia Special", type: "odia-special" },
    { name: "Biryani", type: "biryani" },
    { name: "North Indian", type: "north-indian" },
    { name: "South Indian", type: "south-indian" },
    { name: "Chinese", type: "chinese" },
    { name: "Sweets", type: "sweets" },
    { name: "Beverages", type: "beverages" },
    { name: "Fast Food", type: "fast-food" },
    { name: "Cold Drinks", type: "cold-drinks" },
    { name: "Ice Cream", type: "ice-cream" }
];

export default function CategoryPage() {
    const [location, setLocation] = useLocation();
    const [, params] = useRoute("/category/:categoryName");
    const categoryName = params?.categoryName || "";

    const { data: items, isLoading, error } = useCategoryItems(categoryName);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

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
        if (!items) return [];

        let result = [...items];

        // 1. Veg Status
        if (activeFilters.includes("Veg") || activeFilters.includes("Pure Veg")) {
            result = result.filter(item => item.isVeg);
        } else if (activeFilters.includes("Non-Veg")) {
            result = result.filter(item => !item.isVeg);
        }

        // 2. Rating
        if (activeFilters.includes("Rating 4.0+")) {
            result = result.filter(item => Number(item.restaurant.rating) >= 4.0);
        }

        // 3. Price Sort
        if (activeFilters.includes("Price: Low to High")) {
            result.sort((a, b) => a.price - b.price);
        }

        return result;
    }, [items, activeFilters]);

    // Group by Restaurant
    const groupedByRestaurant = useMemo(() => {
        const groups: Record<number, { restaurant: Restaurant; items: MenuItem[] }> = {};

        filteredItems.forEach(item => {
            if (!groups[item.restaurantId]) {
                groups[item.restaurantId] = {
                    restaurant: item.restaurant,
                    items: []
                };
            }
            groups[item.restaurantId].items.push(item);
        });

        return Object.values(groups);
    }, [filteredItems]);

    const displayTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace("-", " ") + " Specials";

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Sticky Header */}
            <div className="sticky top-16 z-[40] bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm transition-all duration-300">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-secondary shadow-md hover:bg-primary hover:text-white transition-all active:scale-90">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="font-display text-xl font-black text-foreground truncate animate-in-up">
                        {displayTitle}
                    </h1>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in-up" style={{ animationDelay: '100ms' }}>
                {/* Filters */}
                <div className="mb-8 flex flex-wrap items-center gap-3">
                    <FilterPanel
                        activeFilters={activeFilters}
                        onFilterChange={setActiveFilters}
                        categories={CATEGORIES}
                        selectedCategory={categoryName}
                        onCategoryChange={(val) => {
                            if (val) setLocation(`/category/${val}`);
                            else setLocation("/");
                        }}
                    />
                    {activeFilters.map((f) => (
                        <button
                            key={f}
                            onClick={() => toggleFilter(f)}
                            className="rounded-full border-2 border-primary bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
                        >
                            <div className="flex items-center gap-2">
                                {f}
                                <X className="h-3 w-3" onClick={(e) => { e.stopPropagation(); toggleFilter(f); }} />
                            </div>
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="space-y-12">
                        {[1, 2].map(i => (
                            <div key={i} className="space-y-6">
                                <Skeleton className="h-8 w-48 rounded-lg" />
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {[1, 2, 3].map(j => <MenuItemCardSkeleton key={j} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-destructive/10 p-8 text-center text-destructive">
                        <p className="font-bold text-lg">Oops! Something went wrong.</p>
                        <p className="text-sm">We couldn't fetch the {categoryName} items.</p>
                    </div>
                ) : groupedByRestaurant.length === 0 ? (
                    <div className="mt-12 flex flex-col items-center justify-center text-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                            <Filter className="h-10 w-10" />
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-foreground">No matches found</h3>
                        <p className="mt-2 text-muted-foreground">Try adjusting your filters for {categoryName}.</p>
                        <Button variant="outline" className="mt-6" onClick={() => setActiveFilters([])}>
                            Clear all filters
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {groupedByRestaurant.map(({ restaurant, items }) => (
                            <div key={restaurant.id} className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Link href={`/restaurant/${restaurant.id}`}>
                                            <h2 className="font-display text-2xl font-bold hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                                                {restaurant.name}
                                                <ChevronLeft className="h-4 w-4 rotate-180" />
                                            </h2>
                                        </Link>
                                        <p className="text-sm text-muted-foreground">{restaurant.location}</p>
                                    </div>
                                    <div className="flex items-center gap-1 rounded-lg bg-green-500/10 px-2 py-1 text-sm font-bold text-green-600">
                                        <span>{restaurant.rating}</span>
                                        <Star className="h-3.5 w-3.5 fill-current" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {items.map((item, index) => (
                                        <div key={item.id} className="animate-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                            <MenuItemCard item={item} restaurantId={restaurant.id} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
