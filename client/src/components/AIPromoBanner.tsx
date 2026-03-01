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
                className="relative cursor-pointer py-10 px-4 group flex flex-col items-center justify-center text-center"
            >
                <div className="space-y-4 max-w-3xl mx-auto">
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
                        className="text-3xl sm:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r"
                    >
                        ⚡ AI Powered Auto Food Delivery
                    </motion.h2>
                    <p className="text-sm font-bold text-red-500 mt-2 bg-red-500/10 inline-block px-3 py-1 rounded-full border border-red-500/20">
                        - This Feature Coming soon ....
                    </p>

                    <p className="text-base sm:text-lg font-medium text-muted-foreground leading-relaxed opacity-80">
                        Talk to our AI assistant and place your order automatically. <br className="hidden sm:block" />
                        Just click anywhere on this section to start your conversation.
                    </p>

                    <motion.div
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-[11px] uppercase tracking-[0.4em] font-black text-primary"
                    >
                        Click to activate ordering assistant
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
