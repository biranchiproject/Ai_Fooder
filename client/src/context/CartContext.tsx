import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import type { MenuItem } from "@shared/schema";

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem, restaurantId: number) => void;
  removeFromCart: (itemId: number) => void;
  decrementQuantity: (itemId: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  currentRestaurantId: number | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<number | null>(null);

  const addToCart = (item: MenuItem, restaurantId: number) => {
    setItems((prev) => {
      // Prevent ordering from multiple restaurants at once
      if (currentRestaurantId !== null && currentRestaurantId !== restaurantId && prev.length > 0) {
        if (!window.confirm("Your cart contains items from another restaurant. Clear cart and add this item?")) {
          return prev;
        }
        setCurrentRestaurantId(restaurantId);
        return [{ ...item, quantity: 1 }];
      }
      
      setCurrentRestaurantId(restaurantId);
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const decrementQuantity = (itemId: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, quantity: Math.max(0, i.quantity - 1) }
          : i
      ).filter(i => i.quantity > 0)
    );
  };

  const clearCart = () => {
    setItems([]);
    setCurrentRestaurantId(null);
  };

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.price * item.quantity), 0), [items]);

  // Clear restaurant ID if cart becomes empty
  useMemo(() => {
    if (items.length === 0 && currentRestaurantId !== null) {
      setCurrentRestaurantId(null);
    }
  }, [items, currentRestaurantId]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        decrementQuantity,
        clearCart,
        totalItems,
        subtotal,
        currentRestaurantId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
