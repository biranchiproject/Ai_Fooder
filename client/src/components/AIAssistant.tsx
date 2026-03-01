import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Loader2, Sparkles, ShoppingBag, Mic, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    foundItems?: any[];
    foundRestaurants?: any[];
    action?: string;
}

interface OrderState {
    selectedItem: any | null;
    selectedRestaurant: any | null;
    selectedLocation: string | null;
    isOrderConfirmed: boolean;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [orderState, setOrderState] = useState<OrderState>({
        selectedItem: null,
        selectedRestaurant: null,
        selectedLocation: null,
        isOrderConfirmed: false
    });

    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I am your AI food assistant. I am listening..." }
    ]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const isSpeakingRef = useRef(false);
    const { addToCart } = useCart();
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: async (message: string) => {
            const res = await apiRequest("POST", "/api/voice-assistant", { message });
            return res.json();
        },
        onSuccess: (data) => {
            console.log("AI intent:", data.intent);

            const assistantMessage: Message = {
                role: "assistant",
                content: data.response || "I've processed your request.",
                foundItems: data.foundItems,
                foundRestaurants: data.foundRestaurants,
                action: data.action
            };

            // 1. Update Frontend State Machine
            if (data.intent === "search_item" && data.foundItems?.[0]) {
                setOrderState(prev => ({ ...prev, selectedItem: data.foundItems[0] }));
            }
            if (data.intent === "select_restaurant" && data.foundRestaurants?.[0]) {
                setOrderState(prev => ({ ...prev, selectedRestaurant: data.foundRestaurants[0] }));
            }
            if (data.intent === "set_location" && data.location) {
                setOrderState(prev => ({ ...prev, selectedLocation: data.location }));
            }

            setMessages(prev => [...prev, assistantMessage]);

            // 2. Automated Triggers
            if (data.action === "addToCart" && data.itemToConfirm) {
                addToCart(data.itemToConfirm, data.itemToConfirm.restaurantId);
                toast({
                    title: "Order Confirmed!",
                    description: `${data.itemToConfirm.name} has been added to your cart.`,
                });
                setOrderState(prev => ({ ...prev, isOrderConfirmed: true }));
            }

            // 3. Audio Response
            if (assistantMessage.content) {
                speakText(assistantMessage.content);
            }
        },
        onError: (error) => {
            console.error("AI Assistant Error:", error);
            toast({
                title: "Assistant Busy",
                description: "I'm having trouble connecting right now. Please try again in a moment.",
                variant: "destructive"
            });
            setIsListening(false);
            setIsSpeaking(false);
        }
    });

    const speakText = (text: string) => {
        if (!window.speechSynthesis) return;

        // Stop recognition before speaking (Safeguard)
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) { }
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onstart = () => {
            setIsSpeaking(true);
            isSpeakingRef.current = true;
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            // Restart recognition after speech ends (Production logic)
            if (isOpen && recognitionRef.current) {
                setTimeout(() => {
                    if (!isSpeakingRef.current) {
                        try {
                            recognitionRef.current.start();
                        } catch (e) { }
                    }
                }, 300);
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener("open-ai-assistant", handleOpen);
        return () => window.removeEventListener("open-ai-assistant", handleOpen);
    }, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = "en-US";
            recognition.continuous = true;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => {
                setIsListening(false);
                // Continuous restart logic
                if (isOpen && !isSpeakingRef.current) {
                    try {
                        recognition.start();
                    } catch (e) { }
                }
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                console.log("User said:", transcript);
                if (transcript.trim() && !isSpeakingRef.current) {
                    handleVoiceInput(transcript);
                }
            };

            recognition.onerror = (event: any) => {
                if (event.error === 'no-speech') return;
                console.error("Speech recognition error:", event.error);
                if (event.error === 'not-allowed') {
                    toast({
                        title: "Mic Access Required",
                        description: "Please enable microphone permissions.",
                        variant: "destructive"
                    });
                }
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) { }
            }
            speakText("Hello! I am your production AI ordering assistant. What would you like to order today?");
        } else {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleVoiceInput = (text: string) => {
        if (!text.trim() || mutation.isPending || isSpeakingRef.current) return;
        setMessages(prev => [...prev, { role: "user", content: text }]);
        mutation.mutate(text);
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[-1] sm:hidden"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: "100%", scale: 1 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: "100%", scale: 1 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed inset-x-0 bottom-0 w-full sm:static sm:mb-4 sm:w-[450px]"
                            style={{ transformOrigin: "bottom right" }}
                        >
                            <Card className="flex flex-col h-[85vh] sm:h-[600px] rounded-b-none rounded-t-[2.5rem] sm:rounded-b-[2.5rem] overflow-hidden shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-2xl border-primary/20 bg-background/98 backdrop-blur-2xl border-t-2 sm:border-2">
                                {/* Header */}
                                <div className="p-5 bg-primary text-primary-foreground flex items-center justify-between shadow-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                                            <Bot className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black tracking-tighter leading-none text-xl">Voice Ordering</h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.2)]",
                                                    isListening ? "bg-green-400 animate-pulse scale-110" : isSpeaking ? "bg-blue-400 animate-bounce" : "bg-muted"
                                                )} />
                                                <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-90">
                                                    {isSpeaking ? "Speaking" : isListening ? "Auto-Listening" : "Standby"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-full hover:bg-white/20 h-10 w-10"
                                    >
                                        <X className="h-6 w-6" />
                                    </Button>
                                </div>

                                {/* Chat Area */}
                                <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-transparent to-primary/5">
                                    <div className="space-y-5">
                                        {messages.map((msg, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                className={cn(
                                                    "flex w-full",
                                                    msg.role === "user" ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "max-w-[85%] rounded-[1.5rem] p-4 text-sm font-semibold shadow-sm transition-all border",
                                                    msg.role === "user"
                                                        ? "bg-primary text-primary-foreground rounded-tr-none border-primary shadow-lg"
                                                        : "bg-background text-foreground rounded-tl-none border-border/50"
                                                )}>
                                                    {msg.content}

                                                    {(msg.foundItems || msg.foundRestaurants) && (
                                                        <div className="mt-3 space-y-2">
                                                            {msg.foundItems?.slice(0, 2).map((item: any) => (
                                                                <div key={item.id} className="bg-secondary/30 p-2.5 rounded-2xl border border-border/50 flex items-center gap-4">
                                                                    <img src={item.image} className="h-12 w-12 rounded-xl object-cover shadow-md" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-black truncate">{item.name}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-bold opacity-70">₹{item.price / 100}</p>
                                                                    </div>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="secondary"
                                                                        className="h-9 w-9 rounded-xl text-primary shadow-sm"
                                                                        onClick={() => {
                                                                            addToCart(item, item.restaurantId);
                                                                            toast({ title: "Added to cart!" });
                                                                        }}
                                                                    >
                                                                        <ShoppingBag className="h-5 w-5" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {mutation.isPending && (
                                            <div className="flex justify-start">
                                                <div className="bg-secondary/40 rounded-2xl rounded-tl-none p-4 border border-border/50 flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Thinking...</span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={scrollRef} />
                                    </div>
                                </ScrollArea>

                                {/* Advanced Status Visualizer */}
                                <div className="p-10 flex flex-col items-center justify-center bg-secondary/20 border-t border-border/5 backdrop-blur-sm relative overflow-hidden">
                                    <div className="flex items-center gap-6 z-10">
                                        <div className="flex items-end gap-1.5 h-12">
                                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={isListening ? {
                                                        height: [12, 48, 12, 32, 12],
                                                    } : isSpeaking ? {
                                                        height: [8, 24, 8, 16, 8],
                                                    } : { height: 8 }}
                                                    transition={{
                                                        duration: 0.5,
                                                        repeat: Infinity,
                                                        delay: i * 0.08,
                                                    }}
                                                    className={cn(
                                                        "w-1.5 rounded-full transition-colors duration-500",
                                                        isListening ? "bg-primary" : isSpeaking ? "bg-blue-500" : "bg-muted"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col items-center gap-1">
                                        <p className="text-[11px] uppercase tracking-[0.3em] font-black text-primary/70">
                                            {isSpeaking ? "Assistant Speaking" : isListening ? "Listening For Order" : "Standby"}
                                        </p>
                                        {orderState.selectedItem && (
                                            <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                <Sparkles className="h-3 w-3 text-yellow-500" />
                                                Ordering: {orderState.selectedItem.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl border-2 border-white/20 transition-all active:scale-90",
                    isOpen && "bg-destructive rounded-full hidden sm:flex"
                )}
            >
                {isOpen ? <X className="h-8 w-8" /> : (
                    <div className="relative">
                        <Bot className="h-8 w-8" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-2 -right-2"
                        >
                            <Sparkles className="h-4 w-4 text-yellow-300 fill-yellow-300 shadow-sm" />
                        </motion.div>
                    </div>
                )}
            </motion.button>
        </div>
    );
}
