import { allRealtors } from "./retool-api.js";
const USER_CACHE_KEY = "userCache";
export async function getUserData() {
  //   console.log("getUserData called");
  const cached = localStorage.getItem(USER_CACHE_KEY);

  if (cached) {
    console.log("Using cached user data");
    try {
      return JSON.parse(cached);
    } catch {
      localStorage.removeItem(USER_CACHE_KEY); // fallback on parse fail
    }
  }

  // Fetch fresh data
  console.log("Fetching users...");
  const users = await allRealtors();
  if (!users || users.length === 0) {
    console.warn("No users found or API call failed.");
    return [];
  }
  console.log("Users fetched:", users);

  // Cache for future use
  localStorage.setItem("userCache", JSON.stringify(users));

  return users;
}

export function clearuserCache() {
  localStorage.removeItem(USER_CACHE_KEY);
}
