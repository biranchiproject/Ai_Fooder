import { createContext, useContext, ReactNode } from "react";
import {
    useQuery,
    useMutation,
    UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    signInWithPhoneNumber,
    ConfirmationResult,
    UserCredential
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
    logoutMutation: UseMutationResult<void, Error, void>;
    googleSignInMutation: UseMutationResult<User, Error, void>;
    updateProfileMutation: UseMutationResult<User, Error, { fullName: string; mobile: string; address: string }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const {
        data: user,
        error,
        isLoading,
    } = useQuery<User | null, Error>({
        queryKey: ["/api/user"],
        queryFn: getQueryFn({ on401: "returnNull" }),
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", "/api/logout");
            await firebaseSignOut(auth);
        },
        onSuccess: () => {
            queryClient.setQueryData(["/api/user"], null);
            toast({
                title: "Logged out",
                description: "See you again soon!",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Logout failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const googleSignInMutation = useMutation({
        mutationFn: async () => {
            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken();
            const res = await apiRequest("POST", "/api/auth/firebase", { token });
            if (!res.ok) throw new Error("Backend authentication failed");
            return await res.json();
        },
        onSuccess: (user: User) => {
            queryClient.setQueryData(["/api/user"], user);
            toast({
                title: "Login Successful",
                description: `Welcome back, ${user.fullName || "friend"}!`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Google sign-in failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (profileData: { fullName: string; mobile: string; address: string }) => {
            const res = await apiRequest("POST", "/api/user/profile", profileData);
            if (!res.ok) throw new Error("Failed to update profile");
            return await res.json();
        },
        onSuccess: (updatedUser: User) => {
            queryClient.setQueryData(["/api/user"], updatedUser);
            toast({
                title: "Profile Complete",
                description: "Your account is now ready to order!",
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

    return (
        <AuthContext.Provider
            value={{
                user: user ?? null,
                isLoading,
                error,
                logoutMutation,
                googleSignInMutation,
                updateProfileMutation,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
