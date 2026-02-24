import { useRoute, Link } from "wouter";
import { useRestaurant, useMenu } from "@/hooks/use-restaurants";
import { MenuItemCard, MenuItemCardSkeleton } from "@/components/MenuItemCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Star, Clock, Info, ChevronLeft, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function RestaurantDetail() {
  const [, params] = useRoute("/restaurant/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: restaurant, isLoading: isLoadingRestaurant } = useRestaurant(id);
  const { data: menuItems, isLoading: isLoadingMenu } = useMenu(id);
  const { totalItems, subtotal } = useCart();

  // Group menu by category (mocked since category isn't heavily typed in schema, assuming simple strings)
  const groupedMenu = menuItems?.reduce((acc, item) => {
    const cat = item.category || "Recommended";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-secondary/50">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 sm:px-6">
        {isLoadingRestaurant ? (
          <div className="mt-6 space-y-6">
            <Skeleton className="h-48 w-full rounded-[2rem]" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        ) : restaurant && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            {/* Premium Header Card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-card p-6 shadow-xl shadow-black/5 border border-border/50">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div>
                  <h1 className="font-display text-3xl font-black md:text-4xl text-foreground">
                    {restaurant.name}
                  </h1>
                  <p className="mt-2 text-lg text-muted-foreground">{restaurant.cuisine}</p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Mission District • {restaurant.priceRange}
                  </p>
                </div>

                <div className="flex gap-4 bg-secondary p-4 rounded-2xl w-full md:w-auto">
                  <div className="flex flex-col items-center justify-center border-r border-border pr-4">
                    <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                      <Star className="h-5 w-5 fill-current" />
                      {restaurant.rating}
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">10K+ Ratings</span>
                  </div>
                  <div className="flex flex-col items-center justify-center pl-2">
                    <div className="flex items-center gap-1 text-foreground font-bold text-lg">
                      <Clock className="h-5 w-5" />
                      {restaurant.deliveryTime}
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Time</span>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="mt-6 flex items-center gap-3 rounded-xl bg-primary/5 p-4 text-primary">
                <Info className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">Order for $25 or more to get free delivery in your area!</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu Section */}
        <div className="mt-12">
          <h2 className="mb-6 font-display text-2xl font-bold flex items-center gap-3">
            <span>Menu</span>
            <div className="h-px flex-1 bg-border/60" />
          </h2>

          {isLoadingMenu ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => <MenuItemCardSkeleton key={i} />)}
            </div>
          ) : groupedMenu && (
            <div className="space-y-12">
              {Object.entries(groupedMenu).map(([category, items]) => (
                <div key={category} className="space-y-6">
                  <h3 className="font-display text-xl font-bold text-foreground sticky top-[4.5rem] bg-background/95 py-2 z-30 backdrop-blur-sm">
                    {category} <span className="text-muted-foreground text-sm font-medium ml-2">({items.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {items.map((item) => (
                      <MenuItemCard key={item.id} item={item} restaurantId={id} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Footer */}
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        >
          <div className="mx-auto flex max-w-4xl items-center justify-between rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-lg">
            <div>
              <p className="text-sm font-semibold opacity-90">{totalItems} ITEM{totalItems > 1 && 'S'}</p>
              <p className="font-display text-xl font-bold">${(subtotal / 100).toFixed(2)}</p>
            </div>
            <Link href="/cart">
              <Button variant="secondary" className="font-bold rounded-xl h-12 px-6 shadow-md hover:scale-105 transition-transform">
                View Cart
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
