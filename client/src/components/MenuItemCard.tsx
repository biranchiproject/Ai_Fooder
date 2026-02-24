import { useState } from "react";
import { Plus, Minus, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { MenuItem } from "@shared/schema";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export function MenuItemCard({ item, restaurantId }: { item: MenuItem; restaurantId: number }) {
  const { items, addToCart, decrementQuantity } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const cartItem = items.find((i) => i.id === item.id);
  const qty = cartItem?.quantity || 0;

  const handleAdd = () => {
    addToCart(item, restaurantId);
    if (qty === 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const isVeg = item.category.toLowerCase().includes("veg") && !item.category.toLowerCase().includes("non");

  return (
    <div className="flex flex-col-reverse gap-4 rounded-3xl bg-card p-4 shadow-sm border border-border/50 sm:flex-row sm:items-center">
      {/* Content */}
      <div className="flex flex-1 flex-col justify-center">
        {/* Veg/Non-veg indicator */}
        <div className="mb-2 flex items-center gap-2">
          <div className={`flex h-4 w-4 items-center justify-center rounded-sm border-2 ${isVeg ? 'border-green-600' : 'border-red-600'}`}>
            <div className={`h-2 w-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
          </div>
          {isVeg && <span className="text-xs font-semibold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-md">Bestseller</span>}
        </div>
        
        <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
        <p className="mt-1 font-semibold text-foreground/90">{formatPrice(item.price)}</p>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
      </div>

      {/* Image & Controls */}
      <div className="relative flex-shrink-0">
        <div className="h-32 w-full sm:w-32 overflow-hidden rounded-2xl bg-secondary">
          {/* Unsplash menu item image */}
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Add/Remove Button overlapping image */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 shadow-lg rounded-xl overflow-hidden bg-background border border-border">
          <AnimatePresence mode="wait">
            {qty > 0 ? (
              <motion.div
                key="controls"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex h-10 w-28 items-center justify-between"
              >
                <button
                  onClick={() => decrementQuantity(item.id)}
                  className="flex h-full w-1/3 items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-semibold text-primary">{qty}</span>
                <button
                  onClick={handleAdd}
                  className="flex h-full w-1/3 items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleAdd}
                className="relative h-10 w-28 bg-card text-primary font-bold transition-colors hover:bg-secondary"
              >
                ADD
                {isAnimating && (
                  <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 z-10 flex items-center justify-center text-primary"
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function MenuItemCardSkeleton() {
  return (
    <div className="flex flex-col-reverse gap-4 rounded-3xl bg-card p-4 sm:flex-row">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-32 w-full sm:w-32 rounded-2xl" />
    </div>
  );
}
