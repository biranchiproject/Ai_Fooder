import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// Dummy fetch wrapper to handle errors
async function fetchApi(url: string) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || "An error occurred");
  }
  return res.json();
}

export function useRestaurants() {
  return useQuery({
    queryKey: [api.restaurants.list.path],
    queryFn: async () => {
      const data = await fetchApi(api.restaurants.list.path);
      // Let zod parse it to ensure contract
      return api.restaurants.list.responses[200].parse(data);
    },
  });
}

export function useRestaurant(id: number) {
  return useQuery({
    queryKey: [api.restaurants.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.restaurants.get.path, { id });
      const data = await fetchApi(url);
      return api.restaurants.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useMenu(restaurantId: number) {
  return useQuery({
    queryKey: [api.restaurants.menu.path, restaurantId],
    queryFn: async () => {
      const url = buildUrl(api.restaurants.menu.path, { id: restaurantId });
      const data = await fetchApi(url);
      return api.restaurants.menu.responses[200].parse(data);
    },
    enabled: !!restaurantId,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: [api.recommendations.list.path],
    queryFn: async () => {
      const data = await fetchApi(api.recommendations.list.path);
      return api.recommendations.list.responses[200].parse(data);
    },
  });
}
