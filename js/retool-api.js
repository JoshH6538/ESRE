const debug = false;

const BASE_URL = debug
  ? "http://localhost:3000/api/realtors"
  : "https://v3tnqbn900.execute-api.us-east-1.amazonaws.com";

export async function findRealtorById(id) {
  try {
    console.log("Fetching realtor by ID:", id);
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "findRealtor",
        userId: id,
      }),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching realtor by ID:", err);
    return null;
  }
}

export async function allRealtors() {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "allRealtors",
      }),
    });

    if (!response.ok) {
      console.error("API returned error status:", response.status);
      return []; // prevent storing error
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching all realtors:", err);
    return [];
  }
}

export async function allBranches() {
  console.log("allBranches called");
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "allBranches",
      }),
    });

    if (!response.ok) {
      console.error("API returned error status:", response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching all branches:", err);
    return [];
  }
}
