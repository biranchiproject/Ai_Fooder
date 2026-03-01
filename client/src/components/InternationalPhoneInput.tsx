import React, { useState, useEffect } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

interface InternationalPhoneInputProps {
    value: string;
    onChange: (phone: string) => void;
    error?: string;
    disabled?: boolean;
}

const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
    value,
    onChange,
    error,
    disabled
}) => {
    const [defaultCountry, setDefaultCountry] = useState('in');
    const [geoloading, setGeoLoading] = useState(true);

    useEffect(() => {
        const detectLocation = async () => {
            const cached = localStorage.getItem('ai_fooder_detected_country');
            if (cached) {
                setDefaultCountry(cached.toLowerCase());
                setGeoLoading(false);
                return;
            }

            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                if (data.country_code) {
                    const country = data.country_code.toLowerCase();
                    setDefaultCountry(country);
                    localStorage.setItem('ai_fooder_detected_country', country);
                }
            } catch (err) {
                console.warn('Geolocation failed, falling back to India:', err);
                // Default is already 'in'
            } finally {
                setGeoLoading(false);
            }
        };

        detectLocation();
    }, []);

    return (
        <div className="space-y-2 w-full">
            <Label htmlFor="phone-input" className="text-sm font-medium">
                Phone Number
                {geoloading && <span className="ml-2 text-[10px] text-muted-foreground animate-pulse">Detecting country...</span>}
            </Label>
            <div className="relative international-phone-wrapper">
                <PhoneInput
                    defaultCountry={defaultCountry}
                    value={value}
                    onChange={(phone) => onChange(phone)}
                    disabled={disabled}
                    className="w-full flex"
                    inputClassName="!flex !h-11 !w-full !rounded-r-xl !border-y !border-r !border-input !bg-background !px-3 !py-2 !text-lg !font-bold !text-primary !ring-offset-background !placeholder:text-muted-foreground !focus:outline-none !focus:ring-2 !focus:ring-primary !transition-all !disabled:cursor-not-allowed !disabled:opacity-50"
                    countrySelectorStyleProps={{
                        buttonClassName: "!h-11 !rounded-l-xl !border !border-input !bg-secondary/50 !hover:bg-secondary !transition-colors !px-3",
                        flagClassName: "!w-6 !h-auto !rounded-sm",
                    }}
                />
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-semibold text-destructive mt-1"
                >
                    {error}
                </motion.p>
            )}

            <style>{`
                .international-phone-wrapper .react-international-phone-input-container {
                    width: 100%;
                }
                .international-phone-wrapper .react-international-phone-country-selector-button {
                    border-right: none !important;
                }
                /* Production-level Dropdown Styling */
                .react-international-phone-country-selector-dropdown {
                    z-index: 9999 !important;
                    background-color: white !important;
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 12px !important;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
                    margin-top: 8px !important;
                }
            `}</style>
        </div>
    );
};

export default InternationalPhoneInput;
