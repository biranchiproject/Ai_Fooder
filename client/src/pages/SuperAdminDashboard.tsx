import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Utensils, LogOut, Trash2, Plus, Shield, ShieldAlert, ShieldCheck, DollarSign, MapPin, Image as ImageIcon, Store } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { User, MenuItem, Restaurant } from "@shared/schema";

export default function SuperAdminDashboard() {
    const { user, logoutMutation } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    if (!user || user.role !== "superadmin") {
        setLocation("/");
        return null;
    }

    const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "food">("dashboard");

    // Users Query
    const { data: users, isLoading: usersLoading } = useQuery<User[]>({
        queryKey: ["/api/users"],
    });

    // Foods Query
    const { data: foods, isLoading: foodsLoading } = useQuery<(MenuItem & { restaurant: Restaurant })[]>({
        queryKey: ["/api/food"],
    });

    // Mutations
    const promoteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiRequest("POST", `/api/users/${id}/promote`);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            toast({ title: "User promoted to Admin", className: "bg-cyan-950 text-cyan-400 border-cyan-500" });
        }
    });

    const demoteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiRequest("POST", `/api/users/${id}/demote`);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            toast({ title: "User demoted to User", className: "bg-purple-950 text-purple-400 border-purple-500" });
        }
    });

    const deleteFoodMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/food/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/food"] });
            toast({ title: "Food item deleted", className: "bg-red-950 text-red-500 border-red-500" });
        }
    });

    // Add Food Form State
    const [foodForm, setFoodForm] = useState({
        name: "",
        hotelName: "",
        location: "",
        price: "",
        image: "",
    });

    const addFoodMutation = useMutation({
        mutationFn: async (data: typeof foodForm) => {
            const payload = {
                name: data.name,
                hotelName: data.hotelName,
                location: data.location,
                price: data.price,
                image: data.image,
            };
            const res = await apiRequest("POST", `/api/food`, payload);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/food"] });
            toast({ title: "Food item added successfully!", className: "bg-cyan-950 text-cyan-400 border-cyan-500" });
            setFoodForm({ name: "", hotelName: "", location: "", price: "", image: "" });
        },
        onError: () => {
            toast({ title: "Failed to add food", variant: "destructive" });
        }
    });

    // Themes
    const neonCyan = "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";
    const neonPurple = "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]";
    const glassCard = "bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-2xl";

    const renderDashboard = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`${glassCard} p-8 flex flex-col items-center justify-center border-t-2 border-t-cyan-500 hover:scale-105 transition-transform duration-300`}>
                <Users className="w-16 h-16 text-cyan-400 mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                <h3 className={`text-4xl font-bold ${neonCyan}`}>{users?.length || 0}</h3>
                <p className="text-gray-400 mt-2 uppercase tracking-widest text-sm">Total Users</p>
            </div>
            <div className={`${glassCard} p-8 flex flex-col items-center justify-center border-t-2 border-t-purple-500 hover:scale-105 transition-transform duration-300`}>
                <Utensils className="w-16 h-16 text-purple-500 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                <h3 className={`text-4xl font-bold ${neonPurple}`}>{foods?.length || 0}</h3>
                <p className="text-gray-400 mt-2 uppercase tracking-widest text-sm">Total Food Items</p>
            </div>
        </motion.div>
    );

    const renderUsers = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${glassCard} p-6 overflow-x-auto`}>
            <h2 className={`text-2xl font-bold mb-6 ${neonCyan}`}>User Management</h2>
            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase text-xs tracking-wider">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {usersLoading ? (
                        <tr><td colSpan={4} className="p-4 text-center text-cyan-400">Loading...</td></tr>
                    ) : (
                        users?.map((u) => (
                            <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold text-black border border-white/20">
                                        {u.fullName?.charAt(0) || u.username.charAt(0)}
                                    </div>
                                    {u.fullName || u.username}
                                </td>
                                <td className="p-4 text-gray-300">{u.email}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'superadmin' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
                                            'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                        }`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {u.role !== 'superadmin' && (
                                        <div className="flex justify-end gap-2">
                                            {u.role === 'user' ? (
                                                <Button
                                                    onClick={() => promoteMutation.mutate(u.id)}
                                                    disabled={promoteMutation.isPending}
                                                    size="sm"
                                                    className="bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all"
                                                >
                                                    <ShieldCheck className="w-4 h-4 mr-2" /> Promote
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => demoteMutation.mutate(u.id)}
                                                    disabled={demoteMutation.isPending}
                                                    size="sm"
                                                    className="bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all"
                                                >
                                                    <ShieldAlert className="w-4 h-4 mr-2" /> Demote
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </motion.tr>
                        ))
                    )}
                </tbody>
            </table>
        </motion.div>
    );

    const renderFood = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Add Food Form */}
            <div className={`${glassCard} p-6 border-l-4 border-l-cyan-500`}>
                <h2 className={`text-2xl font-bold mb-6 ${neonPurple}`}>Add New Food Item</h2>
                <form onSubmit={(e) => { e.preventDefault(); addFoodMutation.mutate(foodForm); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-gray-400 tracking-wider flex items-center gap-2"><Utensils className="w-3 h-3" /> Food Name</label>
                        <Input
                            value={foodForm.name} onChange={e => setFoodForm({ ...foodForm, name: e.target.value })}
                            required className="bg-black/50 border-cyan-900 focus:border-cyan-500 text-white shadow-inner" placeholder="E.g. Neon Burger"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-gray-400 tracking-wider flex items-center gap-2"><Store className="w-3 h-3" /> Hotel Name</label>
                        <Input
                            value={foodForm.hotelName} onChange={e => setFoodForm({ ...foodForm, hotelName: e.target.value })}
                            required className="bg-black/50 border-cyan-900 focus:border-cyan-500 text-white shadow-inner" placeholder="E.g. Cyber Diner"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-gray-400 tracking-wider flex items-center gap-2"><MapPin className="w-3 h-3" /> Location</label>
                        <Input
                            value={foodForm.location} onChange={e => setFoodForm({ ...foodForm, location: e.target.value })}
                            required className="bg-black/50 border-cyan-900 focus:border-cyan-500 text-white shadow-inner" placeholder="E.g. Sector 7G"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-gray-400 tracking-wider flex items-center gap-2"><DollarSign className="w-3 h-3" /> Price (₹)</label>
                        <Input
                            type="number" value={foodForm.price} onChange={e => setFoodForm({ ...foodForm, price: e.target.value })}
                            required className="bg-black/50 border-cyan-900 focus:border-cyan-500 text-white shadow-inner" placeholder="E.g. 299"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs uppercase text-gray-400 tracking-wider flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Image URL</label>
                        <Input
                            value={foodForm.image} onChange={e => setFoodForm({ ...foodForm, image: e.target.value })}
                            required className="bg-black/50 border-cyan-900 focus:border-cyan-500 text-white shadow-inner" placeholder="https://..."
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-4">
                        <Button
                            type="submit" disabled={addFoodMutation.isPending}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:shadow-[0_0_30px_rgba(34,211,238,1)] transition-all duration-300"
                        >
                            <Plus className="w-5 h-5 mr-2" /> ADD FOOD
                        </Button>
                    </div>
                </form>
            </div>

            {/* Food List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {foods?.map((f) => (
                    <motion.div key={f.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`${glassCard} overflow-hidden group hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-500`}>
                        <div className="relative h-48 overflow-hidden">
                            <img src={f.image} alt={f.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent"></div>
                            <Button
                                onClick={() => deleteFoodMutation.mutate(f.id)}
                                disabled={deleteFoodMutation.isPending}
                                size="icon"
                                className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 hover:scale-100 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="p-5">
                            <h4 className="font-bold text-lg text-white truncate">{f.name}</h4>
                            <p className="text-cyan-400 text-sm flex items-center mt-1 truncate"><Store className="w-3 h-3 mr-1" /> {f.restaurant?.name || "Unknown"}</p>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xl font-black text-purple-400">₹{(f.price / 100).toFixed(0)}</span>
                                <span className="text-xs px-2 py-1 bg-white/10 rounded border border-white/20 text-gray-300 capitalize">{f.category}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );

    return (
        <div className="fixed inset-0 min-h-screen bg-[#0f0f0f] text-gray-100 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col md:flex-row z-[100]">
            {/* Sidebar */}
            <div className="w-full md:w-64 md:border-r border-b border-white/10 bg-black/40 backdrop-blur-2xl flex flex-col z-10 shrink-0 md:shadow-[4px_0_24px_rgba(0,0,0,0.5)] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between md:flex-col md:items-start md:gap-1">
                    <h1 className={`text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2 ${neonCyan}`}>
                        <Shield className="w-5 h-5 md:w-6 md:h-6 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,1)]" />
                        SYS_ADMIN
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] md:text-xs text-purple-400 md:mt-1 uppercase tracking-widest font-mono flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)] animate-pulse"></span>
                            <span className="hidden sm:inline">Superadmin</span>
                        </p>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setLocation("/");
                            }}
                            className="md:hidden h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <nav className="p-2 md:flex-1 md:p-4 flex flex-row md:flex-col gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab("dashboard")}
                        className={`flex-1 md:w-full justify-center md:justify-start text-center md:text-left whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 md:border-b-0 md:border-l-2 border-cyan-400 shadow-[inset_0_-4px_8px_rgba(34,211,238,0.2)] md:shadow-[inset_4px_0_8px_rgba(34,211,238,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5 sm:mr-2 md:mr-3" /> <span className="hidden sm:inline block mt-1 md:mt-0">Dashboard</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab("users")}
                        className={`flex-1 md:w-full justify-center md:justify-start text-center md:text-left whitespace-nowrap ${activeTab === 'users' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 md:border-b-0 md:border-l-2 border-cyan-400 shadow-[inset_0_-4px_8px_rgba(34,211,238,0.2)] md:shadow-[inset_4px_0_8px_rgba(34,211,238,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Users className="w-4 h-4 md:w-5 md:h-5 sm:mr-2 md:mr-3" /> <span className="hidden sm:inline block mt-1 md:mt-0">Manage Users</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab("food")}
                        className={`flex-1 md:w-full justify-center md:justify-start text-center md:text-left whitespace-nowrap ${activeTab === 'food' ? 'bg-purple-500/10 text-purple-400 border-b-2 md:border-b-0 md:border-l-2 border-purple-400 shadow-[inset_0_-4px_8px_rgba(168,85,247,0.2)] md:shadow-[inset_4px_0_8px_rgba(168,85,247,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Utensils className="w-4 h-4 md:w-5 md:h-5 sm:mr-2 md:mr-3" /> <span className="hidden sm:inline block mt-1 md:mt-0">Manage Food</span>
                    </Button>
                </nav>

                <div className="hidden md:block p-4 border-t border-white/10">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setLocation("/");
                        }}
                        className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10 mb-2"
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            logoutMutation.mutate();
                            setLocation("/");
                        }}
                        className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                    >
                        <LogOut className="w-5 h-5 mr-3" /> Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto relative p-4 sm:p-6 md:p-8">
                {/* Background glow effects */}
                <div className="fixed top-[-10%] left-[20%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "dashboard" && renderDashboard()}
                            {activeTab === "users" && renderUsers()}
                            {activeTab === "food" && renderFood()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
