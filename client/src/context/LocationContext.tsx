import React, { createContext, useContext, useState, useEffect } from "react";
import { formatLocation } from "@/lib/location-utils";

interface LocationState {
    address: string;
    city: string;
    pinCode: string;
    formatted_address?: string;
    latitude?: number;
    longitude?: number;
}

interface LocationContextType {
    location: LocationState;
    setLocation: (location: LocationState) => void;
    isLoading: boolean;
    error: string | null;
    useCurrentLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocationState] = useState<LocationState>({
        address: "Bandra, Mumbai",
        city: "Mumbai",
        pinCode: "400050",
        formatted_address: "Mumbai, Maharashtra, 400050"
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize from localStorage if available
    useEffect(() => {
        const savedLocation = localStorage.getItem("user_location");
        if (savedLocation) {
            try {
                setLocationState(JSON.parse(savedLocation));
            } catch (e) {
                console.error("Failed to parse saved location", e);
            }
        }
    }, []);

    const setLocation = (newLocation: LocationState) => {
        setLocationState(newLocation);
        localStorage.setItem("user_location", JSON.stringify(newLocation));
    };

    const useCurrentLocation = async () => {
        setIsLoading(true);
        setError(null);
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Reverse geocoding using Nominatim
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                        { headers: { "Accept-Language": "en" } }
                    );
                    const data = await response.json();
                    const formatted = formatLocation(data);

                    if (formatted) {
                        setLocation({
                            address: formatted.address,
                            city: formatted.city,
                            pinCode: formatted.pinCode,
                            formatted_address: formatted.formatted_address,
                            latitude,
                            longitude
                        });
                    }
                } catch (err) {
                    setError("Failed to fetch address details");
                } finally {
                    setIsLoading(false);
                }
            },
            (err) => {
                setError(err.message);
                setIsLoading(false);
            }
        );
    };

    return (
        <LocationContext.Provider value={{ location, setLocation, isLoading, error, useCurrentLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
};
