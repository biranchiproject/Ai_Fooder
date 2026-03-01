import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InternationalPhoneInput from "@/components/InternationalPhoneInput";
import { MapPin, User as UserIcon, LogIn, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CompleteProfile() {
    const { user, updateProfileMutation } = useAuth();
    const [, setLocation] = useLocation();

    const [fullName, setFullName] = useState("");
    const [mobile, setMobile] = useState("");
    const [address, setAddress] = useState("");
    const [phoneError, setPhoneError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLocation("/auth");
        } else if (user.isProfileComplete) {
            setLocation("/");
        } else {
            setFullName(user.fullName || "");
        }
    }, [user, setLocation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError(null);

        if (!mobile || mobile.length < 10) {
            setPhoneError("Please enter a valid phone number (min 10 digits)");
            return;
        }

        if (fullName && mobile && address) {
            updateProfileMutation.mutate(
                { fullName, mobile, address },
                {
                    onSuccess: () => {
                        setLocation("/");
                    }
                }
            );
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="flex items-center gap-4 mb-6 justify-center">
                        <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center text-3xl font-black shadow-lg">A</div>
                        <span className="text-3xl font-black text-foreground tracking-tighter text-left">Ai fooder</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Complete Profile</h1>
                    <p className="text-muted-foreground mt-2">Just one last step to start ordering!</p>
                </div>

                <Card className="border-2 rounded-3xl overflow-hidden shadow-2xl">
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="bg-secondary/30 pb-6">
                            <CardTitle>Details</CardTitle>
                            <CardDescription>We need these to deliver your favorite food.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-8">
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Full Name</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="fullname"
                                        placeholder="Full Name"
                                        className="pl-10 h-12 rounded-xl text-lg"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <InternationalPhoneInput
                                value={mobile}
                                onChange={(phone) => setMobile(phone)}
                                error={phoneError || undefined}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="address">Delivery Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        placeholder="Flat No, Street, City..."
                                        className="pl-10 h-12 rounded-xl text-lg"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="pb-8 pt-4">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-2xl text-xl font-bold gap-2"
                                disabled={updateProfileMutation.isPending}
                            >
                                {updateProfileMutation.isPending ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground"></div>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Complete Setup
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
