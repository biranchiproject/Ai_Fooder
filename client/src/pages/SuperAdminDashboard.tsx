import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Utensils, LogOut, Trash2, Plus, Shield, ShieldAlert, ShieldCheck, DollarSign, MapPin, Image as ImageIcon, Store, Eye, Upload, X } from "lucide-react";
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

    if (!user || (user.role !== "superadmin" && user.role !== "admin")) {
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

    // My Restaurant Query (for admins)
    const { data: myRestaurant, isLoading: myRestaurantLoading } = useQuery<Restaurant | null>({
        queryKey: ["/api/my-restaurant"],
        enabled: user.role === "admin",
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
        category: "Main Course",
        isVeg: true,
    });

    const addFoodMutation = useMutation({
        mutationFn: async (data: typeof foodForm) => {
            const payload = {
                name: data.name,
                hotelName: user.role === 'admin' ? myRestaurant?.name : data.hotelName,
                location: user.role === 'admin' ? myRestaurant?.location : data.location,
                price: data.price,
                image: data.image,
                category: data.category,
                isVeg: data.isVeg,
            };
            const res = await apiRequest("POST", `/api/food`, payload);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/food"] });
            toast({ title: "Food item added successfully!", className: "bg-cyan-950 text-cyan-400 border-cyan-500" });
            setFoodForm({ name: "", hotelName: "", location: "", price: "", image: "", category: "Main Course", isVeg: true });
        },
        onError: () => {
            toast({ title: "Failed to add food", variant: "destructive" });
        }
    });

    const createRestaurantMutation = useMutation({
        mutationFn: async (data: { name: string, image: string, location: string, cuisine: string }) => {
            const res = await apiRequest("POST", "/api/my-restaurant", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/my-restaurant"] });
            toast({ title: "Restaurant profile updated!", className: "bg-cyan-950 text-cyan-400 border-cyan-500" });
            setIsEditingRestaurant(false);
        }
    });

    const [restaurantForm, setRestaurantForm] = useState({
        name: "",
        image: "",
        location: "",
        cuisine: "Indian",
        city: "Mumbai"
    });

    const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
    const [activeAdminForDishes, setActiveAdminForDishes] = useState<User | null>(null);
    const [showDishesModal, setShowDishesModal] = useState(false);

    // Fetch dishes for a specific admin (used by SuperAdmin or Admin self-view)
    const { data: adminDishes, isLoading: adminDishesLoading } = useQuery<(MenuItem & { restaurant: Restaurant })[]>({
        queryKey: ["/api/admin", activeAdminForDishes?.id, "food"],
        enabled: !!activeAdminForDishes && showDishesModal,
    });

    // File Upload Component
    const FileUpload = ({ onUpload, currentImage, label }: { onUpload: (url: string) => void, currentImage?: string, label: string }) => {
        const [isUploading, setIsUploading] = useState(false);

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                if (data.url) {
                    onUpload(data.url);
                    toast({ title: "Image uploaded successfully" });
                }
            } catch (err) {
                toast({ title: "Upload failed", variant: "destructive" });
            } finally {
                setIsUploading(false);
            }
        };

        return (
            <div className="space-y-4">
                <label className="text-xs uppercase text-gray-400 tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> {label}
                </label>
                <div className="flex items-center gap-4">
                    {currentImage && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                            <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="relative flex-1">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                        />
                        <label
                            htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                            className={`flex items-center justify-center gap-2 w-full p-2 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-sm font-medium ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUploading ? "Uploading..." : <><Upload className="w-4 h-4" /> Choose from Device</>}
                        </label>
                    </div>
                </div>
            </div>
        );
    };

    const DishesModal = () => (
        <AnimatePresence>
            {showDishesModal && activeAdminForDishes && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDishesModal(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`${glassCard} w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col relative z-10 border-cyan-500/30`}
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className={`text-2xl font-black ${neonCyan}`}>
                                    {activeAdminForDishes.id === user.id ? "My Dishes Library" : `Dishes by ${activeAdminForDishes.fullName || activeAdminForDishes.username}`}
                                </h3>
                                <p className="text-gray-400 text-sm">Managing: {adminDishes?.[0]?.restaurant?.name || myRestaurant?.name || "Restaurant Menu"}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowDishesModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {adminDishesLoading ? (
                                <div className="flex justify-center py-12 text-cyan-400">Loading dishes...</div>
                            ) : adminDishes?.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">No dishes posted yet.</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {adminDishes?.map((f) => (
                                        <div key={f.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-cyan-500/30 transition-all">
                                            <img src={f.image} alt={f.name} className="w-20 h-20 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white truncate">{f.name}</h4>
                                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">{f.category}</p>
                                                <p className="text-purple-400 font-bold mt-2">₹{(f.price / 100).toFixed(0)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    // Themes
    const neonCyan = "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";
    const neonPurple = "text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]";
    const glassCard = "bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-2xl";

    const renderDashboard = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {(user.role === 'admin' && (!myRestaurant || isEditingRestaurant) && !myRestaurantLoading) && (
                <div className={`${glassCard} p-8 border-l-4 border-l-cyan-500 relative`}>
                    {isEditingRestaurant && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingRestaurant(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                    )}
                    <h2 className={`text-2xl font-bold mb-6 ${neonCyan}`}>{myRestaurant ? 'Update Your Restaurant Profile' : 'Setup Your Restaurant Profile'}</h2>
                    <form onSubmit={(e) => { e.preventDefault(); createRestaurantMutation.mutate(restaurantForm); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-400 tracking-wider">Restaurant Name</label>
                            <Input value={restaurantForm.name} onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })} required className="bg-black/50 border-cyan-900 focus:border-cyan-500" placeholder="E.g. Neon Bites" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-400 tracking-wider">Location/Address</label>
                            <Input value={restaurantForm.location} onChange={e => setRestaurantForm({ ...restaurantForm, location: e.target.value })} required className="bg-black/50 border-cyan-900 focus:border-cyan-500" placeholder="E.g. Hitech City, Hyderabad" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-400 tracking-wider">Cuisine Type</label>
                            <Input value={restaurantForm.cuisine} onChange={e => setRestaurantForm({ ...restaurantForm, cuisine: e.target.value })} required className="bg-black/50 border-cyan-900 focus:border-cyan-500" placeholder="E.g. Continental, North Indian" />
                        </div>
                        <FileUpload
                            label="Logo/Banner Image"
                            currentImage={restaurantForm.image}
                            onUpload={(url) => setRestaurantForm({ ...restaurantForm, image: url })}
                        />
                        <div className="md:col-span-2 flex justify-end">
                            <Button type="submit" disabled={createRestaurantMutation.isPending} className="bg-cyan-500 text-black font-bold">
                                {createRestaurantMutation.isPending ? "Creating..." : "SAVE RESTAURANT PROFILE"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {user.role === 'admin' && myRestaurant && !isEditingRestaurant && (
                <div className={`${glassCard} p-6 flex flex-col md:flex-row items-center gap-6 border-l-4 border-l-purple-500 relative group`}>
                    <img src={myRestaurant.image} alt={myRestaurant.name} className="w-24 h-24 rounded-2xl object-cover border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                    <div className="flex-1 text-center md:text-left">
                        <h2 className={`text-3xl font-black ${neonPurple}`}>{myRestaurant.name}</h2>
                        <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2 mt-1 italic">
                            <MapPin className="w-4 h-4 text-cyan-400" /> {myRestaurant.location}
                        </p>
                        <p className="text-xs text-purple-400 mt-2 uppercase tracking-widest">{myRestaurant.cuisine}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setRestaurantForm({
                                name: myRestaurant.name,
                                image: myRestaurant.image,
                                location: myRestaurant.location,
                                cuisine: myRestaurant.cuisine,
                                city: myRestaurant.city || "Mumbai"
                            });
                            setIsEditingRestaurant(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 text-cyan-400 hover:bg-cyan-500/10"
                    >
                        Edit Profile
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {user.role === 'superadmin' && (
                    <div className={`${glassCard} p-8 flex flex-col items-center justify-center border-t-2 border-t-cyan-500 hover:scale-105 transition-transform duration-300`}>
                        <Users className="w-16 h-16 text-cyan-400 mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                        <h3 className={`text-4xl font-bold ${neonCyan}`}>{users?.length || 0}</h3>
                        <p className="text-gray-400 mt-2 uppercase tracking-widest text-sm">Total Users</p>
                    </div>
                )}
                <div onClick={() => user.role === 'admin' && setActiveTab("food")} className={`${glassCard} p-8 flex flex-col items-center justify-center border-t-2 border-t-purple-500 hover:scale-105 transition-transform duration-300 cursor-pointer group ${user.role === 'admin' ? 'md:col-span-2' : ''}`}>
                    <Utensils className="w-16 h-16 text-purple-500 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] group-hover:scale-110 transition-transform" />
                    <h3 className={`text-4xl font-bold ${neonPurple}`}>{foods?.length || 0}</h3>
                    <p className="text-gray-400 mt-2 uppercase tracking-widest text-sm">{user.role === 'admin' ? 'My Food Items' : 'Total Food Items'}</p>
                    {user.role === 'admin' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveAdminForDishes(user);
                                setShowDishesModal(true);
                            }}
                            className="mt-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Eye className="w-4 h-4 mr-2" /> View Dish Items
                        </Button>
                    )}
                </div>
            </div>

            {user.role === 'admin' && myRestaurant && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className={`text-xl font-black ${neonCyan} flex items-center gap-2 uppercase tracking-tighter`}>
                            Recent Dishes
                        </h3>
                        <Button
                            onClick={() => setActiveTab("food")}
                            className="bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 text-xs font-bold"
                            size="sm"
                        >
                            <Plus className="w-3 h-3 mr-2" /> Quick Add Dish
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {foods?.slice(0, 4).map((f) => (
                            <div key={f.id} className="p-3 rounded-xl bg-white/5 border border-white/10 group hover:border-cyan-500/30 transition-all flex flex-col gap-3">
                                <div className="relative h-24 rounded-lg overflow-hidden">
                                    <img src={f.image} alt={f.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <span className="absolute bottom-1 right-2 text-[10px] bg-purple-500/80 text-white px-1.5 rounded-full font-bold">₹{(f.price / 100).toFixed(0)}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white truncate">{f.name}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{f.category}</p>
                                </div>
                            </div>
                        ))}
                        {(!foods || foods.length === 0) && (
                            <div className="md:col-span-4 py-8 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-2xl">
                                <p className="text-sm">No dishes added yet. Start growing your menu!</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
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
                        <th className="p-4">Mobile</th>
                        <th className="p-4">Address</th>
                        <th className="p-4">Role</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {usersLoading ? (
                        <tr><td colSpan={6} className="p-4 text-center text-cyan-400">Loading...</td></tr>
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
                                <td className="p-4 text-gray-300 font-mono text-xs">{u.mobile || "N/A"}</td>
                                <td className="p-4 text-gray-300 max-w-[200px] truncate">{u.address || "N/A"}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'superadmin' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
                                            'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                        }`}>
                                        {u.role?.toUpperCase() || "USER"}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {user.role === 'superadmin' && u.role === 'admin' && (
                                            <Button
                                                onClick={() => {
                                                    setActiveAdminForDishes(u);
                                                    setShowDishesModal(true);
                                                }}
                                                size="sm"
                                                className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20"
                                            >
                                                <Eye className="w-4 h-4 mr-2" /> Dishes
                                            </Button>
                                        )}
                                        {(user.role === 'superadmin' && u.role && u.role !== 'superadmin') && (
                                            <>
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
                                            </>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))
                    )}
                </tbody>
            </table>
        </motion.div>
    );

    const renderFood = () => {
        if (user.role === 'superadmin') {
            const adminStats = users?.filter(u => u.role === 'admin').map(admin => {
                const adminFoodCount = foods?.filter(f => f.restaurant?.ownerId === admin.id).length || 0;
                const restaurant = foods?.find(f => f.restaurant?.ownerId === admin.id)?.restaurant;
                return { admin, restaurant, adminFoodCount };
            });

            return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className={`${glassCard} p-6 border-l-4 border-l-cyan-500`}>
                        <h2 className={`text-2xl font-bold mb-6 ${neonCyan}`}>Hotel Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {adminStats?.map(({ admin, restaurant, adminFoodCount }) => (
                                <motion.div
                                    key={admin.id}
                                    whileHover={{ y: -5 }}
                                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-black text-xl">
                                                {restaurant?.name?.charAt(0) || admin.username.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-lg leading-tight">{restaurant?.name || "No Restaurant Setup"}</h4>
                                                <p className="text-xs text-gray-400 mt-1">Owner: {admin.fullName || admin.username}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Dishes</p>
                                            <p className={`text-2xl font-black ${neonPurple}`}>{adminFoodCount}</p>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setActiveAdminForDishes(admin);
                                                setShowDishesModal(true);
                                            }}
                                            size="sm"
                                            variant="ghost"
                                            className="text-cyan-400 hover:bg-cyan-500/10"
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> View Dishes
                                        </Button>
                                    </div>
                                    {restaurant?.location && (
                                        <p className="mt-3 text-[10px] text-gray-500 flex items-center gap-1 italic">
                                            <MapPin className="w-3 h-3" /> {restaurant.location}
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            );
        }

        return (
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
                                value={myRestaurant?.name || ""} disabled
                                className="bg-black/30 border-cyan-900/50 text-gray-500 opacity-60"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-400 tracking-wider flex items-center gap-2"><MapPin className="w-3 h-3" /> Location</label>
                            <Input
                                value={myRestaurant?.location || ""} disabled
                                className="bg-black/30 border-cyan-900/50 text-gray-500 opacity-60"
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
                            <FileUpload
                                label="Food Item Image"
                                currentImage={foodForm.image}
                                onUpload={(url) => setFoodForm({ ...foodForm, image: url })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-gray-400 tracking-wider flex items-center gap-2">Category</label>
                            <Input
                                value={foodForm.category} onChange={e => setFoodForm({ ...foodForm, category: e.target.value })}
                                required className="bg-black/50 border-cyan-900 focus:border-cyan-500 text-white shadow-inner" placeholder="E.g. Main Course"
                            />
                        </div>
                        <div className="space-y-2 flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="isVeg"
                                checked={foodForm.isVeg}
                                onChange={e => setFoodForm({ ...foodForm, isVeg: e.target.checked })}
                                className="w-5 h-5 rounded border-cyan-900 bg-black/50 text-cyan-500 focus:ring-cyan-500"
                            />
                            <label htmlFor="isVeg" className="text-xs uppercase text-gray-400 tracking-wider cursor-pointer font-bold hover:text-cyan-400 transition-colors">Vegetarian Item</label>
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
    };

    return (
        <div className="fixed inset-0 min-h-screen bg-[#0f0f0f] text-gray-100 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col md:flex-row z-[100]">
            {/* Sidebar */}
            <div className="w-full md:w-64 md:border-r border-b border-white/10 bg-black/40 backdrop-blur-2xl flex flex-col z-10 shrink-0 md:shadow-[4px_0_24px_rgba(0,0,0,0.5)] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between md:flex-col md:items-start md:gap-1">
                    <h1 className={`text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2 ${neonCyan}`}>
                        <Shield className="w-5 h-5 md:w-6 md:h-6 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,1)]" />
                        {user.role === 'superadmin' ? 'SYS_ADMIN' : 'ADMIN_PORTAL'}
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] md:text-xs text-purple-400 md:mt-1 uppercase tracking-widest font-mono flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)] animate-pulse"></span>
                            <span className="hidden sm:inline">{user.role === 'superadmin' ? 'Superadmin' : 'Admin'}</span>
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
                    {user.role === 'superadmin' && (
                        <Button
                            variant="ghost"
                            onClick={() => setActiveTab("users")}
                            className={`flex-1 md:w-full justify-center md:justify-start text-center md:text-left whitespace-nowrap ${activeTab === 'users' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 md:border-b-0 md:border-l-2 border-cyan-400 shadow-[inset_0_-4px_8px_rgba(34,211,238,0.2)] md:shadow-[inset_4px_0_8px_rgba(34,211,238,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Users className="w-4 h-4 md:w-5 md:h-5 sm:mr-2 md:mr-3" /> <span className="hidden sm:inline block mt-1 md:mt-0">Manage Users</span>
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab("food")}
                        className={`flex-1 md:w-full justify-center md:justify-start text-center md:text-left whitespace-nowrap ${activeTab === 'food' ? 'bg-purple-500/10 text-purple-400 border-b-2 md:border-b-0 md:border-l-2 border-purple-400 shadow-[inset_0_-4px_8px_rgba(168,85,247,0.2)] md:shadow-[inset_4px_0_8px_rgba(168,85,247,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Utensils className="w-4 h-4 md:w-5 md:h-5 sm:mr-2 md:mr-3" /> <span className="hidden sm:inline block mt-1 md:mt-0">{user.role === 'admin' ? 'Manage My Menu' : 'Manage Hotels'}</span>
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
                <DishesModal />
            </div>
        </div>
    );
}
