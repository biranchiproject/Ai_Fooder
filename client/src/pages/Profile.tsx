import { useAuth } from "@/hooks/use-auth";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type User } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { motion } from "framer-motion";
import { User as UserIcon, Mail, Phone, Palette, Save, Loader2, ArrowLeft, MapPin, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm({
        resolver: zodResolver(insertUserSchema.partial()),
        defaultValues: {
            fullName: user?.fullName || "",
            email: user?.email || "",
            mobile: user?.mobile || "",
            address: user?.address || "",
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data: Partial<User>) => {
            const res = await apiRequest("PATCH", "/api/user", data);
            return res.json();
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["/api/user"], updatedUser);
            toast({
                title: "Profile updated",
                description: "Your profile details have been successfully updated.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background pb-20 pt-10 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="flex items-center gap-4 mb-10">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight">Your Profile</h1>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl font-black flex items-center gap-3">
                                <UserIcon className="h-6 w-6 text-primary" />
                                Personal Details
                                {user.role !== 'user' && (
                                    <span className={cn(
                                        "ml-auto text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border",
                                        user.role === 'superadmin' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                    )}>
                                        {user.role}
                                    </span>
                                )}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">
                                Update your name, email, and contact number.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input {...field} placeholder="Barsha Sahoo" className="pl-11 h-12 bg-background/50 border-border/50 rounded-2xl focus:ring-primary focus:border-primary transition-all font-semibold" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="mobile"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mobile Number</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input {...field} placeholder="+91 82490 00000" className="pl-11 h-12 bg-background/50 border-border/50 rounded-2xl focus:ring-primary focus:border-primary transition-all font-semibold" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-1">
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input {...field} placeholder="barsha@example.com" disabled className="pl-11 h-12 bg-muted/30 border-border/50 rounded-2xl font-semibold opacity-70" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-1">
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                        Delivery Address
                                                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-black">ACTIVE</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-primary/5 rounded-lg group-focus-within:bg-primary/20 transition-colors">
                                                                <MapPin className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <Input
                                                                {...field}
                                                                placeholder="Flat No, Street, City..."
                                                                className="pl-14 h-14 bg-background/50 border-border/50 rounded-2xl focus:ring-primary focus:border-primary transition-all font-bold text-sm tracking-tight placeholder:opacity-40"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-14 rounded-2xl text-lg font-black gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        disabled={updateProfileMutation.isPending}
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Save className="h-5 w-5" />
                                        )}
                                        Save Changes
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Theme Settings Component */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl rounded-[2.5rem] shadow-xl border-2">
                        <CardHeader>
                            <CardTitle className="text-2xl font-black flex items-center gap-3">
                                <Palette className="h-6 w-6 text-primary" />
                                App Appearance
                            </CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">
                                Choose a theme that suits your style.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                    { id: "light", name: "Light", icon: "☀️", class: "bg-white text-black border-slate-200" },
                                    { id: "dark", name: "Dark", icon: "🌙", class: "bg-slate-900 text-white border-slate-800" },
                                    { id: "neon", name: "Cyberpunk", icon: "🌃", class: "bg-black text-primary border-primary/50 shadow-[0_0_15px_-5px_rgba(var(--primary),0.5)]" },
                                    { id: "ocean", name: "Ocean", icon: "🌊", class: "bg-blue-900 text-white border-blue-700" },
                                    { id: "sunset", name: "Sunset", icon: "🌆", class: "bg-orange-900 text-white border-orange-700" },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id as any)}
                                        className={cn(
                                            "group relative flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border transition-all duration-300 overflow-hidden",
                                            t.class,
                                            theme === t.id ? "ring-4 ring-primary ring-offset-4 ring-offset-background scale-[1.05] z-10" : "hover:scale-[1.02] opacity-80 hover:opacity-100"
                                        )}
                                    >
                                        <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{t.icon}</span>
                                        <span className="font-black text-sm uppercase tracking-tighter">{t.name}</span>
                                        {theme === t.id && (
                                            <motion.div
                                                layoutId="active-theme-blob"
                                                className="absolute inset-0 bg-primary/5 -z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
