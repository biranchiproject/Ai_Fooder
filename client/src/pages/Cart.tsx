import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { useRecommendations } from "@/hooks/use-restaurants";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, Trash2, Plus, Minus, Receipt, Percent } from "lucide-react";
import { motion } from "framer-motion";

export default function Cart() {
  const { items, totalItems, subtotal, addToCart, decrementQuantity, clearCart } = useCart();
  const { data: recommendations } = useRecommendations();

  const tax = subtotal * 0.08; // 8% dummy tax
  const deliveryFee = subtotal > 2500 ? 0 : 399; // $3.99 fee, free over $25
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
          <Button size="lg" className="mt-8">Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  const restaurantId = items[0].restaurantId;

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
          {items.map((item) => (
            <motion.div layout key={item.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-secondary shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
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
        {recommendations && recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 font-display text-lg font-bold">Frequently added with your meal</h2>
            <div className="flex gap-4 overflow-x-auto snap-x hide-scrollbar pb-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="snap-start shrink-0 w-36 rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm flex flex-col">
                  <div className="h-24 w-full bg-secondary">
                    <img src={rec.image} alt={rec.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{rec.name}</h4>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="font-bold text-sm">{formatPrice(rec.price)}</span>
                      <button className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
      </main>

      {/* Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Total</p>
            <p className="font-display text-2xl font-black text-primary">{formatPrice(total)}</p>
          </div>
          <Button size="lg" className="flex-1 sm:flex-none w-full sm:w-auto px-12 text-lg shadow-xl hover:scale-[1.02] transition-transform">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
