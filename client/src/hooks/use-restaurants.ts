import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "../lib/queryClient";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Dummy fetch wrapper to handle errors
async function fetchApi(url: string) {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  const res = await fetch(fullUrl, { credentials: "include" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || "An error occurred");
  }
  return res.json();
}

export function useRestaurants() {
  return useInfiniteQuery({
    queryKey: [api.restaurants.list.path],
    queryFn: async ({ pageParam = 0 }) => {
      const url = `${api.restaurants.list.path}?offset=${pageParam}&limit=12`;
      const data = await fetchApi(url);
      return api.restaurants.list.responses[200].parse(data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 12) return undefined;
      return allPages.length * 12;
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

export function useRecommendations(cartItemIds: number[] = []) {
  return useQuery({
    queryKey: ["/api/recommendations", cartItemIds],
    queryFn: async () => {
      if (cartItemIds.length === 0) {
        // Fallback to basic list if cart is empty
        const data = await fetchApi(api.recommendations.list.path);
        return { items: api.recommendations.list.responses[200].parse(data), experiment_group: "control" };
      }

      const fullUrl = "/api/recommendations".startsWith("http") ? "/api/recommendations" : `${API_BASE}/api/recommendations`;
      const res = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart_item_ids: cartItemIds }),
      });

      if (!res.ok) {
        // Fallback to basic list if CSAO engine fails or database is missing
        const fallbackData = await fetchApi(api.recommendations.list.path);
        return { items: api.recommendations.list.responses[200].parse(fallbackData), experiment_group: "fallback" };
      }

      return res.json(); // { items: [], experiment_group: "", cached: boolean }
    },
  });
}

export function useCategoryItems(type: string) {
  return useQuery({
    queryKey: ["/api/category", type],
    queryFn: async () => {
      const url = `/api/category/${type}`;
      const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error("Failed to fetch category items");
      return res.json();
    },
    enabled: !!type,
  });
}

export function useAllMenuItems() {
  return useQuery({
    queryKey: ["/api/food"],
    queryFn: async () => {
      const url = "/api/food";
      const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error("Failed to fetch all food items");
      return res.json();
    },
  });
}

