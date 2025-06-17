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

  // Convert array to plain object: { userId1: user1, userId2: user2, ... }
  const userMap = {};
  for (const user of users) {
    if (user.userId) {
      userMap[user.userId] = user;
    }
  }

  // Cache for future use
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userMap));
  console.log("User map cached:", userMap);

  return userMap;
}

export function clearuserCache() {
  localStorage.removeItem(USER_CACHE_KEY);
}
