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

  // Convert array to hash map: { id1: branch1, id2: branch2, ... }
  const branchMap = new Map();
  for (const branch of branches) {
    if (branch.branchId) {
      branchMap.set(branch.branchId, branch);
    }
  }

  // Cache for future use
  localStorage.setItem(
    BRANCH_CACHE_KEY,
    JSON.stringify(Object.fromEntries(branchMap))
  );

  // clearBranchCache();

  return branchMap;
}

export function clearBranchCache() {
  localStorage.removeItem(BRANCH_CACHE_KEY);
}
