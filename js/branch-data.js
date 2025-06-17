import { allBranches } from "./retool-api.js";
const BRANCH_CACHE_KEY = "branchCache";

export async function getBranches() {
  const cached = localStorage.getItem(BRANCH_CACHE_KEY);

  if (cached) {
    console.log("Using cached branch data");
    try {
      return JSON.parse(cached);
    } catch {
      localStorage.removeItem(BRANCH_CACHE_KEY); // fallback on parse fail
    }
  }

  // Fetch fresh data
  console.log("Fetching branches...");
  const branches = await allBranches();
  if (!branches || branches.length === 0) {
    console.warn("No branches found or API call failed.");
    return [];
  }
  console.log("Branches fetched:", branches);

  // Cache for future use
  localStorage.setItem(BRANCH_CACHE_KEY, JSON.stringify(branches));

  // clearBranchCache();

  return branches;
}

export function clearBranchCache() {
  localStorage.removeItem(BRANCH_CACHE_KEY);
}

export function arrayToMap(array, keyField) {
  const map = new Map();

  for (const item of array) {
    const key = item[keyField];
    if (key !== undefined && key !== null) {
      map.set(key, item);
    }
  }

  return map;
}
