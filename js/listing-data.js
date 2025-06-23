import { allListings } from "./retool-api.js";

const LISTING_CACHE_KEY = "listingCache";

export async function getListings() {
  const cached = localStorage.getItem(LISTING_CACHE_KEY);

  if (cached) {
    console.log("Using cached listings.");
    try {
      return JSON.parse(cached);
    } catch {
      console.warn("Cache parse failed. Clearing corrupted cache.");
      localStorage.removeItem(LISTING_CACHE_KEY);
    }
  }

  console.log("Fetching listings from API...");
  const listings = await allListings();
  if (!Array.isArray(listings) || listings.length === 0) {
    console.warn("No listings returned from API.");
    return [];
  }

  localStorage.setItem(LISTING_CACHE_KEY, JSON.stringify(listings));
  return listings;
}
