import { baseUrl, toCdn } from "./api";

export const cdnifyDeep = (val: any): any => {
  if (typeof val === "string") return toCdn(val);
  if (Array.isArray(val)) return val.map(cdnifyDeep);
  if (val && typeof val === "object") {
    for (const k in val) {
      if (Object.prototype.hasOwnProperty.call(val, k)) {
        val[k] = cdnifyDeep(val[k]);
      }
    }
    return val;
  }
  return val;
};

// Generic fetch wrapper with a timeout abort signal
async function fetchServer(endpoint: string, options: RequestInit = {}, revalidate = 60) {
  const apiBase = process.env.API_URL || baseUrl;
  const url = `${apiBase}${endpoint}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      next: { revalidate, ...options.next },
    });
    clearTimeout(id);
    if (!res.ok) {
      console.error(`Error fetching server endpoint ${endpoint}:`, res.statusText);
      return null;
    }
    const data = await res.json();
    return cdnifyDeep(data);
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      console.warn(`Fetch timed out for endpoint: ${endpoint}`);
    } else {
      console.error(`Network error fetching server endpoint ${endpoint}:`, error);
    }
    return null;
  }
}

export async function getBanners() {
  return fetchServer("/getCoverImages", {}, 3600); // Cache banners for 1 hour
}

export async function getBlogs() {
  return fetchServer("/getAllBlogs", {}, 600); // Cache blogs for 10 minutes
}

export async function getTrips() {
  return fetchServer("/GetAllTripsForUser", {}, 180); // Cache trips for 3 minutes
}

export async function getReviews() {
  return fetchServer("/getAllReviews", {}, 1800); // Cache reviews for 30 minutes
}

export async function getHosts() {
  return fetchServer("/host", {}, 600); // Cache hosts for 10 minutes
}

export async function getHostById(id: string) {
  return fetchServer(`/host/${id}`, {}, 600); // Cache host info for 10 minutes
}

export async function getHostTrips(id: string) {
  return fetchServer(`/host/${id}/trips`, {}, 180); // Cache host trips for 3 minutes
}

export async function getHostReviews(id: string) {
  return fetchServer(
    `/getAllReviewsByHostId/${id}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    },
    600 // Cache reviews for 10 minutes
  );
}

export async function getCategories() {
  return fetchServer("/getAllCategories", {}, 3600); // Cache categories for 1 hour
}

export async function getTripsByCategory(categoryName: string) {
  return fetchServer(
    "/GetTripsByCagtegory",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: categoryName }),
    },
    180 // Cache category trips for 3 minutes
  );
}
