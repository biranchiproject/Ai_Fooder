import { motion } from "framer-motion";
import { Bot, Sparkles, Zap } from "lucide-react";

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
        <section className="mb-12">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.01 }}
                onClick={handleClick}
                className="relative cursor-pointer py-12 px-6 group flex flex-col items-center justify-center text-center rounded-[2.5rem] border border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden"
            >
                {/* Background Glows */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-10 -left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"
                />

                <div className="space-y-6 max-w-3xl mx-auto z-10">
                    <div className="flex justify-center mb-2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="p-3 bg-primary/10 rounded-2xl border border-primary/20"
                        >
                            <Bot className="h-6 w-6 text-primary" />
                        </motion.div>
                    </div>

                    {/* animated Gradient Heading */}
                    <motion.h2
                        animate={{
                            backgroundImage: [
                                "linear-gradient(to right, #ff0080, #7928ca)",
                                "linear-gradient(to right, #0070f3, #00dfd8)",
                                "linear-gradient(to right, #7928ca, #ff0080)"
                            ]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="text-4xl sm:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r leading-tight"
                    >
                        ⚡ AI Powered Auto Food Delivery
                    </motion.h2>

                    <p className="text-[10px] font-black text-white bg-destructive px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-lg shadow-destructive/20 animate-pulse">
                        <Zap className="h-3 w-3 fill-white" /> COMING SOON
                    </p>

                    <p className="text-base sm:text-xl font-medium text-muted-foreground leading-relaxed">
                        Talk to our AI assistant and place your order automatically. <br className="hidden sm:block" />
                        Just click anywhere on this section to start your conversation.
                    </p>

                    <motion.div
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-[11px] uppercase tracking-[0.4em] font-black text-primary bg-primary/5 px-6 py-2 rounded-xl"
                    >
                        Click to activate ordering assistant
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
