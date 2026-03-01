export interface NominatimAddress {
    city?: string;
    town?: string;
    village?: string;
    state_district?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country_code?: string;
}

export interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
    address: NominatimAddress;
}

export const formatLocation = (result: NominatimResult) => {
    const addr = result.address || {};

    // 1. Filter results to only India (if country_code is available)
    if (addr.country_code && addr.country_code !== "in") {
        return null;
    }

    // 2. Extract city using fallback
    const city = addr.city || addr.town || addr.village || addr.state_district || addr.county || addr.state || "Unknown City";

    // 3. Extract state
    const state = addr.state || "";

    // 4. Extract pincode
    const pinCode = addr.postcode || "";

    // 5. Format result: City, State, PIN Code
    const parts = [city];
    if (state && !city.includes(state)) parts.push(state);
    if (pinCode) parts.push(pinCode);

    return {
        address: result.display_name,
        city: city,
        formatted_address: parts.join(", "),
        pinCode: pinCode,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
    };
};
