const debug = false;

const BASE_URL = debug
  ? "http://localhost:3000/api/realtors"
  : "https://v3tnqbn900.execute-api.us-east-1.amazonaws.com";

async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Expected array");
      return data;
    } catch (err) {
      console.warn(`Attempt ${attempt} failed:`, err.message);
      if (attempt < retries) await new Promise((res) => setTimeout(res, delay));
    }
  }
  return []; // fallback if all retries fail
}

export async function findRealtorById(id) {
  console.log("Fetching realtor by ID:", id);
  return await fetchWithRetry(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "findRealtor",
      userId: id,
    }),
  });
}

export async function allRealtors() {
  return await fetchWithRetry(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "allRealtors" }),
  });
}

export async function allBranches() {
  console.log("allBranches called");
  return await fetchWithRetry(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "allBranches" }),
  });
}
