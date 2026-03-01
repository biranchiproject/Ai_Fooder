import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface FilterPanelProps {
    activeFilters: string[];
    onFilterChange: (filters: string[]) => void;
    categories?: { name: string; type: string }[];
    selectedCategory?: string | null;
    onCategoryChange?: (category: string | null) => void;
}

export function FilterPanel({
    activeFilters,
    onFilterChange,
    categories,
    selectedCategory,
    onCategoryChange
}: FilterPanelProps) {
    const [tempFilters, setTempFilters] = useState<string[]>(activeFilters);
    const [tempCategory, setTempCategory] = useState<string | null>(selectedCategory || null);

    const toggleFilter = (filter: string) => {
        setTempFilters(prev => {
            let next = [...prev];
            if (next.includes(filter)) {
                next = next.filter(f => f !== filter);
            } else {
                // Exclusive logic for Veg group
                if (filter === "Veg") next = next.filter(f => f !== "Non-Veg" && f !== "Pure Veg");
                if (filter === "Non-Veg") next = next.filter(f => f !== "Veg" && f !== "Pure Veg");
                if (filter === "Pure Veg") next = next.filter(f => f !== "Veg" && f !== "Non-Veg");
                next.push(filter);
            }
            return next;
        });
    };

    const applyFilters = () => {
        onFilterChange(tempFilters);
        if (onCategoryChange) onCategoryChange(tempCategory);
    };

    const resetFilters = () => {
        setTempFilters([]);
        setTempCategory(null);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-full px-5 hover:bg-primary hover:text-primary-foreground hover:border-primary border-border">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">Filters</SheetTitle>
                </SheetHeader>

                <div className="py-8 space-y-8 h-[calc(100vh-180px)] overflow-y-auto">
                    {/* Category Selector */}
                    {categories && (
                        <div className="space-y-4">
                            <Label className="text-base font-bold">Category</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map(cat => (
                                    <Button
                                        key={cat.type}
                                        variant={tempCategory === cat.type ? "default" : "outline"}
                                        className="justify-start h-auto py-3 px-4 rounded-xl text-sm"
                                        onClick={() => setTempCategory(tempCategory === cat.type ? null : cat.type)}
                                    >
                                        {cat.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Veg / Non-Veg Toggles */}
                    <div className="space-y-4">
                        <Label className="text-base font-bold">Dietary Preference</Label>
                        <div className="space-y-4 rounded-2xl border border-border p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Vegetarian</Label>
                                    <p className="text-xs text-muted-foreground">Show only veg items</p>
                                </div>
                                <Switch
                                    checked={tempFilters.includes("Veg")}
                                    onCheckedChange={() => toggleFilter("Veg")}
                                />
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-4">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Non-Vegetarian</Label>
                                    <p className="text-xs text-muted-foreground">Show only non-veg items</p>
                                </div>
                                <Switch
                                    checked={tempFilters.includes("Non-Veg")}
                                    onCheckedChange={() => toggleFilter("Non-Veg")}
                                />
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-4">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Pure Veg</Label>
                                    <p className="text-xs text-muted-foreground">Strictly pure veg items</p>
                                </div>
                                <Switch
                                    checked={tempFilters.includes("Pure Veg")}
                                    onCheckedChange={() => toggleFilter("Pure Veg")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="space-y-4">
                        <Label className="text-base font-bold">Minimum Rating</Label>
                        <div className="space-y-6 px-2">
                            <Slider
                                defaultValue={[tempFilters.includes("Rating 4.0+") ? 4 : 0]}
                                max={5}
                                step={0.5}
                                onValueChange={(vals) => {
                                    if (vals[0] >= 4.0) {
                                        if (!tempFilters.includes("Rating 4.0+")) setTempFilters([...tempFilters, "Rating 4.0+"]);
                                    } else {
                                        setTempFilters(tempFilters.filter(f => f !== "Rating 4.0+"));
                                    }
                                }}
                            />
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>Any</span>
                                <span>4.0+ Stars</span>
                                <span>5.0 Stars</span>
                            </div>
                        </div>
                    </div>

                    {/* Price Range placeholder as requested */}
                    <div className="space-y-4">
                        <Label className="text-base font-bold">Price Range</Label>
                        <RadioGroup defaultValue="any" className="flex flex-wrap gap-2">
                            {["any", "low", "medium", "high"].map(v => (
                                <div key={v} className="flex items-center space-x-2">
                                    <RadioGroupItem value={v} id={`price-${v}`} className="sr-only" />
                                    <Label
                                        htmlFor={`price-${v}`}
                                        className="h-10 px-4 rounded-full border border-border flex items-center justify-center cursor-pointer hover:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-all"
                                    >
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>

                <SheetFooter className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-6 flex items-center gap-4">
                    <Button variant="ghost" className="flex-1 rounded-xl h-12" onClick={resetFilters}>
                        Reset
                    </Button>
                    <Button className="flex-[2] rounded-xl h-12" onClick={applyFilters}>
                        Apply Filters
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
