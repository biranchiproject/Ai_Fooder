import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import RestaurantDetail from "@/pages/RestaurantDetail";
import Cart from "@/pages/Cart";
import AuthPage from "@/pages/AuthPage";
import CompleteProfile from "@/pages/CompleteProfile";
import CategoryPage from "@/pages/CategoryPage";
import Orders from "@/pages/Orders";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import { Navbar } from "@/components/layout/Navbar";
import { AIAssistant } from "@/components/AIAssistant";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

function ProtectedRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    } else if (!isLoading && user && !user.isProfileComplete && path !== "/complete-profile") {
      setLocation("/complete-profile");
    }
  }, [user, isLoading, setLocation, path]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;
  if (!user.isProfileComplete && path !== "/complete-profile") return null;

  return <Component />;
}

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/complete-profile">
          {(params) => <ProtectedRoute component={CompleteProfile} path="/complete-profile" />}
        </Route>
        <Route path="/" component={Home} />
        <Route path="/restaurant/:id" component={RestaurantDetail} />
        <Route path="/category/:categoryName" component={CategoryPage} />
        <Route path="/cart">
          {() => <Cart />}
        </Route>
        <Route path="/orders" component={Orders} />
        <Route path="/superadmin">
          {() => <ProtectedRoute component={SuperAdminDashboard} path="/superadmin" />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      <AIAssistant />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <LocationProvider>
            <CartProvider>
              <Toaster />
              <Router />
            </CartProvider>
          </LocationProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
