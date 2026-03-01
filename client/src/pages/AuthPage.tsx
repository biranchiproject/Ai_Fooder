import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

export default function AuthPage() {
    const { user, googleSignInMutation } = useAuth();
    const [, setLocation] = useLocation();

    if (user) {
        if (!user.isProfileComplete) {
            setLocation("/complete-profile");
        } else {
            setLocation("/");
        }
        return null;
    }

    return (
        <div className="flex min-h-screen bg-background relative overflow-hidden">
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-50">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-background/50 backdrop-blur-md shadow-lg border border-border/50 hover:bg-secondary">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </Link>
            </div>

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg"
                >
                    <div className="flex items-center gap-4 mb-12 justify-center overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                            className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg"
                        >
                            A
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-5xl font-black tracking-tighter animate-text-wave bg-clip-text text-transparent pb-2"
                        >
                            Ai fooder
                        </motion.h1>
                    </div>

                    <Card className="border-2 rounded-[2.5rem] shadow-2xl overflow-hidden bg-card/80 backdrop-blur-xl">
                        <CardContent className="p-12 text-center text-balance">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="text-4xl font-black mb-4 leading-tight"
                            >
                                Fastest Delivery in your city.
                            </motion.h2>
                            <p className="text-muted-foreground text-xl mb-12">Login with Google to start your food journey.</p>

                            <button
                                onClick={() => googleSignInMutation.mutate()}
                                disabled={googleSignInMutation.isPending}
                                className="w-full h-16 rounded-2xl text-2xl font-bold flex items-center justify-center gap-4 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-primary-foreground disabled:opacity-50"
                            >
                                {googleSignInMutation.isPending ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-foreground"></div>
                                ) : (
                                    <>
                                        <svg className="w-8 h-8" viewBox="0 0 48 48">
                                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                        </svg>
                                        Google
                                    </>
                                )}
                            </button>

                            <p className="mt-8 text-muted-foreground text-sm uppercase tracking-widest font-bold">Safe • Secure • Fast</p>
                        </CardContent>
                    </Card>

                    <div className="mt-12 text-center text-muted-foreground">
                        By continuing, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                    </div>
                </motion.div>
            </div>

            <div className="hidden lg:flex flex-1 relative bg-[#0a0a0a]">
                <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
                    alt="Premium Food"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>

                <div className="absolute bottom-20 left-20 right-20 text-white">
                    <h3 className="text-6xl font-black tracking-tighter mb-4">Good food. <br /> Good life.</h3>
                    <p className="text-2xl text-white/60">The world's fastest food delivery platform.</p>
                </div>
            </div>
        </div>
    );
}
