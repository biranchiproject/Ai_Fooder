import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { useRecommendations, useRestaurant } from "@/hooks/use-restaurants";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, Trash2, Plus, Minus, Receipt, Percent, MapPin, ArrowLeft, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation as useGlobalLocation } from "@/context/LocationContext";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LocationSelector } from "@/components/LocationSelector";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { items, totalItems, subtotal, addToCart, decrementQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: recommendations } = useRecommendations(items.map(i => i.id), user?.id);
  const { location } = useGlobalLocation();
  const [, setPathLocation] = useLocation();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const restaurantId = items[0]?.restaurantId;
  const { data: restaurant } = useRestaurant(restaurantId as number);

  useEffect(() => {
    if (recommendations?.items && recommendations.items.length > 0) {
      recommendations.items.forEach((rec: any) => {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user?.id || null,
            cart_id: items.map(i => i.id).sort().join(","),
            item_id: rec.id,
            type: "impression",
            experiment_group: recommendations.experiment_group || "control",
            cart_value: subtotal, // Phase 4: AOV telemetry
          })
        }).catch(console.error);
      });
    }
  }, [recommendations?.items]);

  const handleCheckout = () => {
    if (!user) {
      setPathLocation("/auth");
      return;
    }

    // Phase 4: Fire checkout tracking event with order_value for AOV measurement
    if (recommendations?.experiment_group && items.length > 0) {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || null,
          cart_id: items.map(i => i.id).sort().join(","),
          item_id: items[0]?.id, // Primary item from cart
          type: "checkout",
          experiment_group: recommendations.experiment_group,
          order_value: total,        // Full order value (after GST + delivery)
          cart_value: subtotal,      // Cart subtotal before fees
        })
      }).catch(console.error);
    }

    toast({
      title: "Order Placed Successfully!",
      description: "Redirecting to your orders...",
    });
    clearCart();
    setPathLocation("/orders");
  };

  const tax = subtotal * 0.05; // 5% GST
  const deliveryFee = subtotal > 50000 ? 0 : 4000; // ₹40 fee, free over ₹500
  const total = subtotal + tax + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 h-48 w-48 rounded-full bg-secondary flex items-center justify-center"
        >
          {/* Unsplash empty cart metaphor */}
          <img src="https://images.unsplash.com/photo-1606836591695-4d58a73eba1e?q=80&w=400&auto=format&fit=crop" alt="Empty plate" className="w-full h-full object-cover rounded-full opacity-50 grayscale" />
        </motion.div>
        <h1 className="font-display text-3xl font-black text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground max-w-sm">Looks like you haven't added anything to your cart yet. Go ahead and explore top restaurants!</p>
        <Link href="/">
          <Button size="lg" className="mt-8 rounded-2xl gap-2 shadow-xl hover:scale-105 transition-all">
            <ArrowLeft className="h-5 w-5" />
            Browse Restaurants
          </Button>
        </Link>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href={`/restaurant/${restaurantId}`}>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-display text-xl font-bold">Checkout</h1>
          </div>
          <Button variant="ghost" onClick={clearCart} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* Cart Items List */}
        <div className="rounded-3xl bg-card p-6 shadow-sm border border-border/50 space-y-6 mb-8">
          {restaurant && (
            <div className="flex items-center gap-3 pb-4 border-b border-border/50 text-foreground">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{restaurant.name}</h3>
                <p className="text-sm font-semibold text-muted-foreground line-clamp-1">Delivery in {restaurant.delivery_time}</p>
              </div>
            </div>
          )}
          {items.map((item) => (
            <motion.div layout key={item.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-secondary shrink-0">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
                      (e.target as HTMLImageElement).onerror = null; // Prevent infinite loops
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-foreground line-clamp-1">{item.name}</h3>
                  <p className="text-sm font-semibold text-muted-foreground">{formatPrice(item.price)}</p>
                </div>
              </div>

              <div className="flex h-10 w-28 items-center justify-between rounded-xl border border-border bg-background px-1 shadow-sm shrink-0">
                <button onClick={() => decrementQuantity(item.id)} className="p-2 text-muted-foreground hover:text-foreground">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-bold text-primary">{item.quantity}</span>
                <button onClick={() => addToCart(item, restaurantId)} className="p-2 text-muted-foreground hover:text-foreground">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}

          <div className="pt-4 border-t border-dashed border-border flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer">
            <Plus className="h-4 w-4" /> Add more items
          </div>
        </div>

        {/* CSAO Rail - Frequently Added */}
        {recommendations?.items && (
          <div className="mb-8">
            {(() => {
              const filteredRecs = recommendations.items.filter((rec: any) => !items.some(i => i.id === rec.id)).slice(0, 5);
              if (filteredRecs.length === 0) return null;
              return (
                <>
                  <h2 className="mb-4 font-display text-lg font-bold">Frequently added with your meal</h2>
                  <div className="flex gap-4 overflow-x-auto touch-pan-x snap-x pb-4 min-h-[200px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <AnimatePresence mode="popLayout">
                      {filteredRecs.map((rec: { id: number, name: string, price: number, image: string }) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.8, width: 0 }}
                          animate={{ opacity: 1, scale: 1, width: "144px" }}
                          exit={{ opacity: 0, scale: 0.8, width: 0 }}
                          transition={{ duration: 0.3 }}
                          key={rec.id}
                          className="snap-start shrink-0 rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm flex flex-col"
                        >
                          <div className="h-24 w-full bg-secondary overflow-hidden">
                            <img
                              src={rec.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"}
                              alt={rec.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
                                (e.target as HTMLImageElement).onerror = null;
                              }}
                            />
                          </div>
                          <div className="p-3 flex flex-col flex-1">
                            <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{rec.name}</h4>
                            <div className="mt-auto pt-2 flex items-center justify-between">
                              <span className="font-bold text-sm">{formatPrice(rec.price)}</span>
                              <button
                                onClick={() => {
                                  fetch("/api/track", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      user_id: user?.id || null,
                                      cart_id: items.map(i => i.id).sort().join(","),
                                      item_id: rec.id,
                                      type: "click",
                                      experiment_group: recommendations.experiment_group || "control",
                                      cart_value: subtotal, // Phase 4: cart value at click time
                                    })
                                  }).catch(console.error);

                                  fetch("/api/track", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      user_id: user?.id || null,
                                      cart_id: items.map(i => i.id).sort().join(","),
                                      item_id: rec.id,
                                      type: "add_to_cart",
                                      experiment_group: recommendations.experiment_group || "control",
                                      cart_value: subtotal, // Phase 4: cart value at add time
                                    })
                                  }).catch(console.error);

                                  const pseudoItem = {
                                    id: rec.id, // Offset ID removed, using true ID
                                    restaurantId: restaurantId,
                                    name: rec.name,
                                    description: "Recommendation",
                                    price: rec.price,
                                    image: rec.image,
                                    category: "Add-ons",
                                    isVeg: true,
                                    isPureVeg: true,
                                    type: "other"
                                  } as any;
                                  addToCart(pseudoItem, restaurantId);
                                }}
                                className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Offers / Promos */}
        <div className="mb-8 rounded-2xl bg-card border border-border/50 p-4 flex items-center gap-4 shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Percent className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-foreground">Apply Coupon</h4>
            <p className="text-sm text-muted-foreground">Save on your order</p>
          </div>
          <ChevronLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
        </div>

        {/* Bill Details */}
        <div className="rounded-3xl bg-card p-6 shadow-sm border border-border/50 space-y-4">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5" /> Bill Details
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item Total</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-semibold text-green-600">{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes & Charges</span>
              <span className="font-semibold">{formatPrice(tax)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-border pt-4 flex justify-between items-center text-lg">
            <span className="font-bold text-foreground">To Pay</span>
            <span className="font-black text-foreground">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Delivery Address Section */}
        <div className="mt-8 rounded-3xl bg-card p-6 shadow-sm border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Delivery Address
            </h2>
            <Dialog open={isLocationOpen} onOpenChange={setIsLocationOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5">
                  Change
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border/50 p-6 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Change Delivery Location</DialogTitle>
                </DialogHeader>
                <LocationSelector onClose={() => setIsLocationOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/30">
            <p className="font-bold text-foreground">{location.city}, {location.pinCode}</p>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{location.address}</p>
          </div>
        </div>
      </main>

      {/* Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Total</p>
            <p className="font-display text-2xl font-black text-primary">{formatPrice(total)}</p>
          </div>
          <Button onClick={handleCheckout} size="lg" className="flex-1 sm:flex-none w-full sm:w-auto px-12 text-lg shadow-xl hover:scale-[1.02] transition-transform">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
