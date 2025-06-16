const debug = false;

const BASE_URL = debug
  ? "http://localhost:3000/api/realtors"
  : "https://v3tnqbn900.execute-api.us-east-1.amazonaws.com";

export async function findRealtorById(id) {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "findRealtor",
        _id: { $oid: id },
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

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching all realtors:", err);
    return [];
  }
}

export async function allRealtorUsers() {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "allRealtorUsers",
      }),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching all realtors:", err);
    return [];
  }
}
