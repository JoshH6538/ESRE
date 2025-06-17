import { allRealtors } from "./retool-api.js";
import { getBranches } from "./branch-data.js";
import { getUserData } from "./user-data.js";

let allRealtorsData = [];

// This function loads all realtors and renders them on the page
// allRealtorsData is updated with the full list of realtors
async function loadRealtors() {
  const raw = localStorage.getItem("userCache");
  let allRealtorsData = {};

  if (raw) {
    try {
      allRealtorsData = JSON.parse(raw);
    } catch {
      console.error("userCache is corrupted");
      return;
    }
  } else {
    console.warn("No realtor data in localStorage");
    return;
  }

  const realtorArray = Object.values(allRealtorsData);
  renderRealtors(realtorArray);
  updateResultsCount(realtorArray.length);
}

function renderRealtors(realtorArray) {
  let branches = {};
  const raw = localStorage.getItem("branchCache");
  if (raw) {
    branches = JSON.parse(raw);
  }

  console.log("Rendering Realtors:", realtorArray);
  console.log("Fetching Branches:", branches);

  const container = document.getElementById("realtorContainer");
  container.innerHTML = "";

  for (const realtor of realtorArray) {
    const iconURL =
      realtor["iconURL"] && realtor["iconURL"].trim() !== ""
        ? realtor["iconURL"]
        : "images/lazy.svg";

    const branchName = branches[realtor.branchId]?.name ?? "Unknown Branch";

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
            <a href="realtor_details.html?userId=${realtor.userId}">${
      realtor.firstName ?? "First"
    } ${realtor.lastName ?? "Last"}</a>
          </h6>
          <div class="designation">${realtor.title ?? "Agent"}</div>
        </div>
      </div>
    `;

    container.appendChild(col);
  }
}

// This function updates the total number of results displayed
function updateResultsCount(count) {
  const totalSpan = document.getElementById("total");
  if (totalSpan) totalSpan.textContent = count;
}

// Search bar functionality
// Event listener for the search form submission
document.getElementById("realtorSearchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const query = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  const filtered = allRealtorsData.filter((realtor) => {
    // Combine first name, lastName, and convert to lowercase
    const name = `${realtor["firstName"] ?? ""} ${
      realtor["lastName"] ?? ""
    }`.toLowerCase();
    // Convert DRE # and Zipcode to lowercase
    const dre = (realtor["dre"] ?? "").toLowerCase();
    // const zip = (realtor["zipcode"] ?? "").toLowerCase(); // new Zipcode field

    // Return true if any of the fields match the query
    return name.includes(query) || dre.includes(query);
  });
  const currentSort = document.getElementById("sortSelect").value;
  const sortedFiltered = sortRealtors(filtered, currentSort);
  renderRealtors(sortedFiltered);
  updateResultsCount(sortedFiltered.length);

  //   If no realtors match the search, display a message
  if (filtered.length === 0) {
    const container = document.getElementById("realtorContainer");
    container.innerHTML = "<p>No realtors found.</p>";
  }

  // Update the results count
  updateResultsCount(filtered.length);
});

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
document.getElementById("sortSelect").addEventListener("change", (e) => {
  console.log("Changes");
  const sorted = sortRealtors(allRealtorsData, e.target.value);
  console.log("Realtors sorted:", allRealtorsData);
  renderRealtors(sorted);
  updateResultsCount(sorted.length);
});

window.addEventListener("DOMContentLoaded", async () => {
  await getUserData(); // optional pre-load
  await getBranches(); // populates branchCache

  await loadRealtors(); // handles full load
});
