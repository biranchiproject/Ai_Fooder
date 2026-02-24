import { Link } from "wouter";
import { Star, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Restaurant } from "@shared/schema";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurant/${restaurant.id}`} className="block group">
      <motion.div
        whileHover={{ y: -4 }}
        className="relative overflow-hidden rounded-[2rem] bg-card p-3 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
          {/* Unsplash restaurant food image */}
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
          
          {/* Floating rating badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-green-500/90 px-2 py-1 text-sm font-bold text-white backdrop-blur-md">
            <span>{restaurant.rating}</span>
            <Star className="h-3 w-3 fill-current" />
          </div>
          
          {/* Estimated time */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg bg-background/90 px-2 py-1 text-xs font-semibold text-foreground backdrop-blur-md">
            <Clock className="h-3 w-3" />
            <span>{restaurant.deliveryTime}</span>
          </div>
        </div>
        
        <div className="mt-4 px-2 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-display text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
          </div>
          
          <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
            <p className="line-clamp-1 flex-1">{restaurant.cuisine}</p>
            <span className="font-medium px-2">{restaurant.priceRange}</span>
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
