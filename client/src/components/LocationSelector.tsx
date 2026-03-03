import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/context/LocationContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatLocation } from "@/lib/location-utils";

interface Suggestion {
    display_name: string;
    lat: string;
    lon: string;
    address: {
        city?: string;
        town?: string;
        village?: string;
        postcode?: string;
    };
}

export function LocationSelector({ onClose }: { onClose: () => void }) {
    const { location, setLocation, useCurrentLocation, isLoading: isLocating } = useLocation();
    const [search, setSearch] = useState("");
    const [pinSearch, setPinSearch] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounced address search
    useEffect(() => {
        if (search.length < 3) {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            setError(null);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&addressdetails=1&countrycodes=in&limit=10&featuretype=settlement,road`,
                    { headers: { "Accept-Language": "en" } }
                );
                const data = await response.json();
                setSuggestions(data);
            } catch (err) {
                setError("Failed to fetch suggestions");
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // PIN code search
    useEffect(() => {
        if (pinSearch.length !== 6) return;

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            setError(null);
            setSuggestions([]); // Clear old results
            try {
                // Using 'postalcode' combined with 'q=India' for better reliability in Nominatim
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&postalcode=${pinSearch}&countrycodes=in&addressdetails=1&limit=5`,
                    { headers: { "Accept-Language": "en" } }
                );
                const data = await response.json();

                if (data.length === 0) {
                    setError(`No locations found for PIN code ${pinSearch}`);
                }
                setSuggestions(data);
            } catch (err) {
                setError("Failed to fetch areas for PIN code");
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [pinSearch]);

    const handleSelect = (s: any) => {
        const formatted = formatLocation(s);
        if (formatted) {
            setLocation({
                address: formatted.address,
                city: formatted.city,
                pinCode: formatted.pinCode,
                formatted_address: formatted.formatted_address,
                latitude: formatted.latitude,
                longitude: formatted.longitude
            });
            onClose();
        }
    };

    return (
        <div className="p-1 space-y-6">
            <Button
                variant="outline"
                className="w-full h-14 rounded-2xl gap-3 text-primary border-primary/20 hover:bg-primary/5 shadow-sm"
                onClick={useCurrentLocation}
                disabled={isLocating}
            >
                {isLocating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Navigation className="h-5 w-5" />
                )}
                <span className="font-bold">Use Current Location</span>
            </Button>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Search Location</Label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Enter area, street or landmark..."
                            className="h-14 pl-12 rounded-2xl bg-secondary/50 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {isSearching && search && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                    <div className="h-px flex-1 bg-border/50"></div>
                    <span className="text-xs font-bold text-muted-foreground uppercase">OR</span>
                    <div className="h-px flex-1 bg-border/50"></div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Search by PIN Code</Label>
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Enter 6-digit PIN code"
                            maxLength={6}
                            className="h-14 pl-12 rounded-2xl bg-secondary/50 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                            value={pinSearch}
                            onChange={(e) => setPinSearch(e.target.value.replace(/[^0-9]/g, ""))}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"
                    >
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSelect(s)}
                                className="w-full text-left p-4 rounded-2xl hover:bg-secondary border border-transparent hover:border-border transition-all group"
                            >
                                <div className="flex gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary" />
                                    <div>
                                        <p className="font-bold text-foreground line-clamp-1">{s.display_name.split(",")[0]}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{s.display_name}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex gap-2 items-center">
                    <X className="h-4 w-4" />
                    {error}
                </div>
            )}
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <label className={cn("block", className)}>{children}</label>;
}
