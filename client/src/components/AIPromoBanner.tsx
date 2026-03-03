import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

export function AIPromoBanner() {
    const handleClick = () => {
        // 1. Dispatch custom event to open the AI Assistant
        window.dispatchEvent(new CustomEvent("open-ai-assistant"));

        // 2. Smoothly scroll to the AI assistant icon at the bottom right
        const assistantButton = document.querySelector(".fixed.bottom-6.right-6");
        if (assistantButton) {
            assistantButton.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="mb-6">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.01 }}
                onClick={handleClick}
                className="relative cursor-pointer py-4 px-6 group flex items-center justify-between bg-primary/5 rounded-[1.5rem] border border-primary/20 hover:bg-primary/10 transition-all shadow-sm overflow-hidden"
            >
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full relative z-10">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                            <Zap className="h-5 w-5 text-primary fill-primary animate-pulse" />
                        </div>
                        <motion.h2
                            className="text-lg sm:text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#0070f3] leading-none"
                            animate={{ opacity: [0.9, 1, 0.9] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            AI Powered Auto Ordering
                        </motion.h2>
                    </div>

                    <div className="hidden sm:block h-8 w-px bg-border/20 rotate-12" />

                    <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                            <span className="text-[10px] font-black text-white bg-destructive px-2 py-0.5 rounded uppercase tracking-tighter">New</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Voice Assistant</span>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground truncate leading-tight">
                            Place your order automatically with just one voice command.
                        </p>
                    </div>

                    <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                    >
                        Activate Assistant
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30">
                            <Zap className="h-3 w-3" />
                        </div>
                    </motion.div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0 group-hover:bg-primary/10 transition-colors" />
            </motion.div>
        </section>
    );
}
