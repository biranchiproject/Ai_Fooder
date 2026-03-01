import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronLeft, Receipt, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Orders() {
    const mockOrders = [
        {
            id: "ORD-98231",
            date: "28 Feb 2026, 12:40 PM",
            status: "Delivered",
            total: "₹450",
            restaurant: "Biryani Tadka",
            items: "1x Special Hyderabad Dum Biryani, 1x Coke",
            location: "Cuttack, Odisha"
        },
        {
            id: "ORD-98102",
            date: "25 Feb 2026, 08:15 PM",
            status: "Delivered",
            total: "₹320",
            restaurant: "Desi Pizza Dine",
            items: "1x Ai fooder Special Pizza",
            location: "Cuttack, Odisha"
        }
    ];

    return (
        <div className="min-h-screen bg-background pb-32">
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="mx-auto max-w-3xl flex items-center gap-4 px-4 py-4 sm:px-6">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="h-10 w-10 border-border/50 rounded-full hover:bg-secondary">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="font-display text-2xl font-black text-primary">Order History</h1>
                </div>
            </header>
            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
                {mockOrders.map((order, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={order.id} className="rounded-3xl bg-card p-6 shadow-sm border border-border/50 transition-all hover:border-primary/50">
                        <div className="flex justify-between items-start mb-4 pb-4 border-b border-border/50">
                            <div>
                                <h3 className="font-bold text-lg text-foreground">{order.restaurant}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {order.location}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-primary text-lg">{order.total}</p>
                                <p className="text-xs font-bold text-green-500 flex items-center gap-1 justify-end mt-1"><CheckCircle2 className="h-3 w-3" />{order.status}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-semibold flex items-start gap-2 text-foreground/80"><Receipt className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /> {order.items}</p>
                            <p className="text-xs tracking-wider text-muted-foreground uppercase flex items-center gap-2 font-medium"><Clock className="h-4 w-4 shrink-0" /> {order.date}</p>
                        </div>
                        <div className="mt-5 pt-5 border-t border-dashed border-border flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-all shadow-sm">Reorder</Button>
                            <Button variant="outline" className="flex-1 rounded-xl font-bold hover:bg-secondary transition-all shadow-sm">Rate Order</Button>
                        </div>
                    </motion.div>
                ))}
            </main>
        </div>
    );
}
