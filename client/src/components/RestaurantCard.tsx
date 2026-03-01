import { Link } from "wouter";
import { Star, Clock, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Restaurant } from "@shared/schema";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

import { useRestaurant, useMenu } from "@/hooks/use-restaurants";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export function RestaurantCard({ restaurant, activeFilters }: { restaurant: Restaurant; activeFilters?: string[] }) {
  const { data: menuItems } = useMenu(restaurant.id);
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to restaurant page

    if (menuItems && menuItems.length > 0) {
      // Add the first item as a quick add
      addToCart(menuItems[0], restaurant.id);
    }
  };

  const filterQuery = activeFilters?.includes("Pure Veg")
    ? "?filter=pure-veg"
    : activeFilters?.includes("Veg")
      ? "?filter=veg"
      : activeFilters?.includes("Non-Veg")
        ? "?filter=non-veg"
        : "";

  return (
    <Link href={`/restaurant/${restaurant.id}${filterQuery}`} className="block group">
      <motion.div
        whileHover={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-2xl bg-card p-4 transition-all duration-200 hover:shadow-md"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
              (e.target as HTMLImageElement).onerror = null;
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Offer Tag */}
          <div className="absolute flex items-center bottom-3 left-0 rounded-r-md bg-blue-600 px-2 py-0.5 text-[11px] font-black tracking-wider text-white shadow-md">
            {restaurant.is_bestseller === "yes" ? "60% OFF up to ₹120" : "50% OFF"}
          </div>

          {/* Veg/Non-veg icon overlay */}
          <div className="absolute top-2 right-2 flex items-center justify-center h-5 w-5 rounded bg-white/90 backdrop-blur-sm shadow-sm">
            <div className={`h-2.5 w-2.5 rounded-full ${restaurant.is_veg === "veg" || restaurant.is_pure_veg_restaurant ? "bg-green-600" : "bg-red-600"}`} />
          </div>

          {/* Time & Distance Over Image */}
          <div className="absolute bottom-3 right-2 flex items-center gap-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-foreground shadow-sm">
            <Clock className="h-3 w-3" />
            <span>{restaurant.delivery_time}</span>
          </div>
        </div>

        <div className="mt-3 px-1">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-lg font-bold text-foreground">
              {restaurant.name}
            </h3>
            <div className="flex shrink-0 items-center justify-center gap-1 rounded bg-green-700 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm mt-0.5">
              {restaurant.rating}
              <Star className="h-3 w-3 fill-current" />
            </div>
          </div>

          {/* Cuisine & Price Row */}
          <div className="mt-0.5 flex items-center justify-between text-[13px] text-muted-foreground truncate">
            <p className="line-clamp-1 flex-1">{restaurant.cuisine}</p>
            <span className="shrink-0">{restaurant.price_range} for one</span>
          </div>

          {/* Decorative Divider */}
          <div className="mt-3 border-t border-border/60 border-dashed" />

          {/* Quick ADD Footer */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground line-clamp-1 flex items-center gap-1.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">★</span>
              {menuItems?.[0]?.name ? `Featured: ${menuItems[0].name}` : "Check full menu"}
            </p>

            <div onClick={(e) => e.stopPropagation()}>
              {menuItems && menuItems.length > 0 ? (
                <Button
                  onClick={handleQuickAdd}
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-md border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-white font-bold px-3 shadow-sm transition-all"
                >
                  ADD <span className="ml-1 font-semibold opacity-90 text-[10px]">{formatPrice(menuItems[0].price)}</span>
                </Button>
              ) : (
                <div className="rounded-md bg-secondary/80 px-2 py-1 text-[10px] font-bold text-muted-foreground">
                  View
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="rounded-[2rem] bg-card p-3 shadow-sm">
      <Skeleton className="aspect-[4/3] w-full rounded-[1.5rem]" />
      <div className="mt-4 px-2 pb-2 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
