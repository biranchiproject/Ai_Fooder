import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

// Requirement: Match the JSON structure from the real PostgreSQL API
interface Recommendation {
    id: number;
    name: string;
    score: string; // API returns string from .toFixed(4)
}

interface SmartSuggestionsProps {
    cartItemIds: number[];
    restaurantId: number; // Required to add items to cart under correct context
}

export function SmartSuggestions({ cartItemIds, restaurantId }: SmartSuggestionsProps) {
    const { addToCart } = useCart();

    const [isVisible, setIsVisible] = useState(false);
    const [suggestions, setSuggestions] = useState<Recommendation[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-carousel effect to cycle through suggestions every 4 seconds
    useEffect(() => {
        if (!isVisible || suggestions.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % suggestions.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isVisible, suggestions.length]);

    // Fetch logic on mount OR when cartItemIds changes
    useEffect(() => {
        let isMounted = true;

        async function fetchRecommendations() {
            // Don't fetch if cart is empty
            if (cartItemIds.length === 0) {
                if (isMounted) setIsVisible(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/recommendations", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ cart_item_ids: cartItemIds }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch recommendations");
                }

                const data: Recommendation[] = await response.json();

                if (isMounted) {
                    if (data && data.length > 0) {
                        setSuggestions(data);
                        setCurrentIndex(0);
                        setIsVisible(true);
                    } else {
                        setIsVisible(false);
                    }
                }
            } catch (err) {
                console.error("CSAO API Error:", err);
                if (isMounted) {
                    setError("Failed to load suggestions.");
                    // We can optionally keep the popup hidden on error, or show an error state
                    setIsVisible(true);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchRecommendations();

        return () => {
            isMounted = false;
        };
    }, [cartItemIds]); // Re-run whenever the cart configuration changes

    // If completely hidden or no cart, render nothing
    if (!isVisible && !isLoading) return null;

    const handleAddSuggestion = (suggestion: Recommendation) => {
        // Requirements: Must add the suggested item to the cart using Context. 
        // Since the API only returns id and name currently (no price/img in new API spec),
        // we use fallback visual details just to satisfy the Context requirements.
        addToCart({
            id: suggestion.id,
            restaurantId: restaurantId,
            name: suggestion.name,
            price: 15000,
            category: "Recommendation",
            description: "AI Recommended Item based on your cart",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
            isVeg: true,
            isPureVeg: false,
            type: "other",
            cuisineType: "Recommended"
        }, restaurantId);

        // Cycle to next suggestion
        if (suggestions.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % suggestions.length);
        } else {
            setIsVisible(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                className="fixed bottom-24 right-4 sm:right-6 lg:right-12 z-50 w-80 sm:w-96"
            >
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/80 backdrop-blur-2xl shadow-2xl p-4">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/20 p-1.5 rounded-full">
                                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            </div>
                            <span className="text-sm font-semibold text-white tracking-tight">Smart Suggestion</span>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Body Content Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-6">
                            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                            <p className="text-sm text-gray-400">Analyzing cart with AI...</p>
                        </div>
                    )}

                    {/* Body Content Error State */}
                    {!isLoading && error && (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                            <p className="text-sm font-medium text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Body Content Empty State */}
                    {!isLoading && !error && suggestions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                            <p className="text-sm font-medium text-gray-400">No suggestions available.</p>
                        </div>
                    )}

                    {/* Body Content Success State */}
                    {!isLoading && !error && suggestions.length > 0 && (
                        <div className="flex items-center gap-4">

                            <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={suggestions[currentIndex].id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h4 className="font-bold text-base text-white line-clamp-2 leading-tight tracking-tight">
                                            {suggestions[currentIndex].name}
                                        </h4>
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                                                AI Match Score: {parseFloat(suggestions[currentIndex].score).toFixed(1)}
                                            </span>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={() => handleAddSuggestion(suggestions[currentIndex])}
                                className="h-12 w-12 shrink-0 rounded-2xl bg-white text-black font-black flex items-center justify-center hover:bg-primary hover:text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            >
                                <Plus className="h-6 w-6" />
                            </button>
                        </div>
                    )}

                    {/* Progress Indicators */}
                    {!isLoading && !error && suggestions.length > 1 && (
                        <div className="flex gap-1.5 mt-4 justify-center">
                            {suggestions.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-4 bg-primary' : 'w-1.5 bg-white/20'}`}
                                />
                            ))}
                        </div>
                    )}

                </div>
            </motion.div>
        </AnimatePresence>
    );
}
