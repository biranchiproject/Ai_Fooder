import { useState } from "react";
import { Plus, Minus, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { MenuItem } from "@shared/schema";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

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

  const isVeg = item.isVeg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="flex flex-row justify-between gap-3 sm:gap-5 rounded-3xl bg-card p-4 sm:p-5 pb-8 sm:pb-9 shadow-sm border border-border/50 hover:shadow-lg transition-shadow items-start sm:items-center relative"
    >
      {/* Content */}
      <div className="flex flex-1 flex-col justify-center">
        {/* Veg/Non-veg indicator */}
        <div className="mb-2 flex items-center gap-2">
          <div className={`flex h-4 w-4 items-center justify-center rounded-sm border-2 ${isVeg ? 'border-green-600' : 'border-red-600'}`}>
            <div className={`h-2 w-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
          </div>
        </div>

        <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] uppercase tracking-wider font-bold bg-secondary px-2 py-0.5 rounded text-muted-foreground">
            {item.cuisineType}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 px-2 py-0.5 rounded text-primary">
            {item.type}
          </span>
        </div>
        <p className="mt-1 font-semibold text-foreground/90">{formatPrice(item.price)}</p>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
      </div>

      {/* Image & Controls */}
      <div className="relative flex-shrink-0 self-center">
        <div className="h-[100px] w-[100px] sm:h-[130px] sm:w-[130px] overflow-hidden rounded-2xl bg-secondary shadow-inner relative group">
          {/* Unsplash menu item image */}
          <img
            src={item.image || "https://images.unsplash.com/photo-1570197788417-0e82375c9391?w=400&q=80"}
            alt={`Delicious ${item.name}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80") {
                target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
              }
              target.onerror = null;
            }}
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
                className="flex h-9 sm:h-10 px-4 sm:px-6 w-full items-center justify-center font-black text-primary hover:bg-secondary transition-colors"
                style={{
                  color: isAnimating ? 'transparent' : undefined
                }}
              >
                {!isAnimating && "ADD"}
              </motion.button>
            )}
          </AnimatePresence>
          {isAnimating && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-primary bg-primary/10"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1, opacity: 0 }}
            >
              <Check className="h-5 w-5" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
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
