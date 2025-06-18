import { allRealtors } from "./retool-api.js";
import { getBranches, arrayToMap } from "./branch-data.js";
import { getUserData } from "./user-data.js";

let allRealtorsData = []; // now an array
let branchMap = new Map(); // Initialize branchMap
// Load realtors from localStorage as a JSON array
async function loadRealtors() {
  const raw = localStorage.getItem("userCache");

  if (raw) {
    try {
      allRealtorsData = JSON.parse(raw); // no Object.values needed
    } catch {
      console.error("userCache is corrupted");
      return;
    }
  } else {
    console.warn("No realtor data in localStorage");
    return;
  }

  renderRealtors(allRealtorsData);
  updateResultsCount(allRealtorsData.length);
}

// Render the cards
function renderRealtors(realtorArray) {
  let branches = {};
  const raw = localStorage.getItem("branchCache");
  if (raw) {
    branches = JSON.parse(raw);
  }
  branchMap = arrayToMap(branches, "branchId"); // Ensure branches is a map
  console.log("Rendering Realtors:", realtorArray);
  console.log("Using Branches:", branchMap);

  const container = document.getElementById("realtorContainer");
  container.innerHTML = "";

  for (const realtor of realtorArray) {
    if (realtor && realtor.lastName === "Chu") console.log("Realtor:", realtor);
    const iconURL =
      realtor.iconURL && realtor.iconURL.trim() !== ""
        ? realtor.iconURL
        : "images/lazy.svg";

    const branch = branchMap.get(realtor.branchId);
    const branchName = branch?.name ?? "Unknown Branch";
    const col = document.createElement("div");
    col.className = "col-xl-3 col-md-4 col-sm-6";

    col.innerHTML = `
      <div class="agent-card-two position-relative z-1 mb-50 wow fadeInUp">
        <div class="media ${
          iconURL !== "images/lazy.svg" ? "bg-white" : "bg-dark"
        } position-relative overflow-hidden">
          <div class="tag bg-white position-absolute text-uppercase">${branchName}</div>
          <img
            loading="lazy"
            src="${iconURL}"
            class="agent-img w-100 tran5s"
            alt=""
          >
        </div>
        <div class="text-center pt-30">
          <h6 class="name">
            <a href="realtor_details.html?userId=${realtor.userId}">
              ${realtor.firstName ?? "First"} ${realtor.lastName ?? "Last"}
            </a>
          </h6>
          <div class="designation">${realtor.title ?? "Agent"}</div>
        </div>
      </div>
    `;

    container.appendChild(col);
  }
}

// Update results count
function updateResultsCount(count) {
  const totalSpan = document.getElementById("total");
  if (totalSpan) totalSpan.textContent = count;
}

// Search form handler
document.getElementById("realtorSearchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const query = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  const filtered = allRealtorsData.filter((realtor) => {
    const name = `${realtor.firstName ?? ""} ${
      realtor.lastName ?? ""
    }`.toLowerCase();
    const dre = (realtor.dre ?? "").toLowerCase();
    const branchName = (
      branchMap.get(realtor.branchId)?.name ?? ""
    ).toLowerCase();

    const zipcode = (realtor.zipcode ?? "").toLowerCase();
    const zipcode2 = (realtor.zipcode2 ?? "").toLowerCase();
    const branchZipcode = (
      branchMap.get(realtor.branchId)?.address?.zipcode ?? ""
    ).toLowerCase();
    const branchCity = (
      branchMap.get(realtor.branchId)?.address?.city ?? ""
    ).toLowerCase();

    return (
      name.includes(query) ||
      dre.includes(query) ||
      branchName.includes(query) ||
      zipcode.includes(query) ||
      zipcode2.includes(query) ||
      branchZipcode.includes(query) ||
      branchCity.includes(query)
    );
  });

  const currentSort = document.getElementById("sortSelect").value;
  const sortedFiltered = sortRealtors(filtered, currentSort);

  if (sortedFiltered.length === 0) {
    document.getElementById("realtorContainer").innerHTML =
      "<p>No realtors found.</p>";
  } else {
    renderRealtors(sortedFiltered);
  }

  updateResultsCount(sortedFiltered.length);
});

// Sort function
function sortRealtors(data, sortBy) {
  const [key, order] = sortBy.split("-");

  return data.slice().sort((a, b) => {
    const valA = (a[key] ?? "").toLowerCase();
    const valB = (b[key] ?? "").toLowerCase();

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });
}

// Sort dropdown listener
document.getElementById("sortSelect").addEventListener("change", (e) => {
  const sorted = sortRealtors(allRealtorsData, e.target.value);
  renderRealtors(sorted);
  updateResultsCount(sorted.length);
});

// Initial setup
window.addEventListener("DOMContentLoaded", async () => {
  await getUserData(); // If this populates userCache
  await getBranches(); // Loads branchCache
  await loadRealtors(); // Reads from userCache and renders
});
