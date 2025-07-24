import { allRealtors } from "./api.js";
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
  // Sort the realtors by last name
  allRealtorsData.sort((a, b) => {
    const lastNameA = (a.lastName ?? "").toLowerCase();
    const lastNameB = (b.lastName ?? "").toLowerCase();
    return lastNameA.localeCompare(lastNameB);
  });
  // Move all no image cards to the end
  allRealtorsData.sort((a, b) => {
    const hasIconA = Boolean(a.iconURL);
    const hasIconB = Boolean(b.iconURL);
    return hasIconB - hasIconA; // false (0) goes after true (1)
  });
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
  // console.log("Rendering Realtors:", realtorArray);
  // console.log("Using Branches:", branchMap);

  const container = document.getElementById("realtorContainer");
  container.innerHTML = "";

  if (realtorArray.length === 0) {
    console.warn("[Render] No realtors found");
    container.innerHTML = `
      <div class="text-center py-5">
        <p class="fs-4 text-muted">No realtors found matching your criteria.</p>
      </div>
    `;
    return;
  }

  for (const realtor of realtorArray) {
    const iconURL =
      realtor.iconURL && realtor.iconURL.trim() !== ""
        ? realtor.iconURL
        : "https://equitysmartloans.com/wp-content/uploads/2022/05/placeHolder.jpeg";

    const branch = branchMap.get(realtor.branchId);
    const branchName = branch?.name ?? "Unknown Branch";
    const dre = realtor.dre ? `DRE: ${realtor.dre}` : "No DRE";
    const col = document.createElement("div");
    col.className = "col-xl-3 col-md-4 col-sm-6";

    col.innerHTML = `
      <div class="agent-card-two position-relative z-1 mb-50 wow fadeInUp">
        <div class="media position-relative overflow-hidden">
          <div class="tag bg-white position-absolute text-uppercase">${dre}</div>
          <a href="realtor_details.html?userId=${
            realtor.userId
          }" class="position-relative d-block">
            <img
              loading="lazy"
              src="${iconURL}"
              class="agent-img w-100 tran5s"
              alt=""
            >
          </a>
        </div>
        <div class="text-center pt-30">
          <h6 class="name">
            <a href="realtor_details.html?userId=${realtor.userId}">
              ${realtor.firstName ?? "First"} ${realtor.lastName ?? "Last"}
            </a>
          </h6>
        </div>
      </div>
    `;

    container.appendChild(col);
  }
  // SECTION: FIlter Modal
  const branchFilter = document.getElementById("branchFilter");
  if (branchFilter) {
    branchFilter.innerHTML = ""; // Clear existing content
    // Sort branches by name
    let sortedBranches = Array.from(branchMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // TESTING REMOVE NON CA BRANCHES
    // Filter out branches not in CA
    sortedBranches = sortedBranches.filter((branch) => {
      // Exclude branches with "fl" in
      return (
        !branch.name.toLowerCase().includes(" fl") &&
        !branch.name.toLowerCase().includes("fl ")
      );
    });
    // Move all no image cards to the end
    sortedBranches.sort((a, b) => {
      const hasIconA = Boolean(a.iconURL);
      const hasIconB = Boolean(b.iconURL);
      return hasIconB - hasIconA; // false (0) goes after true (1)
    });
    // console.log("[Filter] Branches after CA filter:", sortedBranches);
    sortedBranches.forEach((branch) => {
      const li = document.createElement("li");
      li.classList.add("branch-option");
      li.innerHTML = `
        <input type="checkbox" value="${branch.branchId}" />
        <label><span>${branch.name}</span></label>
      `;
      branchFilter.appendChild(li);
    });
  }
}
//  SECTION: Filter Submit
document
  .getElementById("realtorFitlerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const form = e.target;

    // Get Title
    const title = form.querySelector("select")?.value?.trim();

    // Get Zipcode
    const zipcode = form.querySelector('input[type="text"]')?.value?.trim();

    // Get Checked Branches

    const selectedBranchIds = Array.from(
      form.querySelectorAll("#branchFilter input[type='checkbox']:checked")
    ).map((cb) => cb.value);

    // === Start with full list ===
    let filtered = allRealtorsData.slice();

    // === Title filter ===
    // if (title !== "(none)") {
    //   filtered = filtered.filter((realtor) => {
    //     return title != "" && realtor.title.includes(title);
    //   });
    // }

    // === Zipcode filter ===
    if (zipcode !== "(none)") {
      filtered = filtered.filter((realtor) => {
        const match = (realtor.zipcode ?? "").startsWith(zipcode);
        return match;
      });
    }

    // === Branch filter ===
    if (selectedBranchIds.length > 0) {
      const selectedBranchSet = new Set(selectedBranchIds); // fast lookup

      filtered = filtered.filter((realtor) => {
        const branchId = realtor.branchId;

        const match = selectedBranchSet.has(branchId);

        return match;
      });
    }

    // === Summary ===
    // console.log(
    //   `[Filter] Final result count: ${filtered.length} of ${allRealtorsData.length}`
    // );

    // === Sort & Render ===
    const currentSort = document.getElementById("sortSelect").value;
    const sortedFiltered = sortRealtors(filtered, currentSort);

    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("advanceFilterModal")
    );
    if (modal) {
      document.activeElement?.blur();
      modal.hide();

      // console.log("[Filter] Modal closed.");
    }

    const clearBtn = document.getElementById("clearFiltersBtn");

    // Check if any filters were used
    if (areFiltersActive({ title, zipcode: zipcode, selectedBranchIds })) {
      clearBtn.classList.remove("d-none");
      // console.log("[UI] Showing Clear Filters button");
    } else {
      clearBtn.classList.add("d-none");
      // console.log("[UI] Hiding Clear Filters button");
    }
    // Move all no image cards to the end
    sortedFiltered.sort((a, b) => {
      const hasIconA = Boolean(a.iconURL);
      const hasIconB = Boolean(b.iconURL);
      return hasIconB - hasIconA; // false (0) goes after true (1)
    });

    renderRealtors(sortedFiltered);
    updateResultsCount(sortedFiltered.length);
  });

// Check if any filters are active
function areFiltersActive({ title, zipcode, selectedBranchIds }) {
  return (
    title !== "(none)" || zipcode !== "(none)" || selectedBranchIds.length > 0
  );
}
// Clear Filters Functionality
document.getElementById("clearFiltersBtn").addEventListener("click", () => {
  // console.log("[Action] Clear Filters clicked.");

  const form = document.getElementById("realtorFitlerForm");

  // Reset all form inputs
  form.reset();

  // Manually uncheck any dynamically generated checkboxes
  form
    .querySelectorAll('#branchFilter input[type="checkbox"]')
    .forEach((cb) => (cb.checked = false));

  // Reset nice-select dropdowns if used
  if (typeof jQuery !== "undefined" && $.fn.niceSelect) {
    $("select").niceSelect("update");
  }

  // Hide the button again
  document.getElementById("clearFiltersBtn").classList.add("d-none");
  // Move all no image cards to the end

  // Re-render all realtors
  renderRealtors(allRealtorsData);
  updateResultsCount(allRealtorsData.length);

  // console.log("[Filter] Cleared filters and restored full list.");
});

// Reset Filter Functionality
document
  .getElementById("resetFilterBtn")
  .addEventListener("click", function (e) {
    e.preventDefault(); // prevent jumping to top

    const form = document.getElementById("realtorFitlerForm");

    // 1. Reset all form inputs
    form.reset();

    // 2. Manually uncheck any dynamically generated checkboxes (e.g., in #branchFilter)
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });

    // 3. Reset nice-select dropdowns if you're using that library
    if (typeof jQuery !== "undefined" && $.fn.niceSelect) {
      $("select").niceSelect("update"); // refresh the UI
    }

    // console.log("Filters reset");
  });

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
  // Move all no image cards to the end
  sortedFiltered.sort((a, b) => {
    const hasIconA = Boolean(a.iconURL);
    const hasIconB = Boolean(b.iconURL);
    return hasIconB - hasIconA; // false (0) goes after true (1)
  });

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
  // Move all no image cards to the end
  sorted.sort((a, b) => {
    const hasIconA = Boolean(a.iconURL);
    const hasIconB = Boolean(b.iconURL);
    return hasIconB - hasIconA; // false (0) goes after true (1)
  });
  renderRealtors(sorted);
  updateResultsCount(sorted.length);
});

// Initial setup
window.addEventListener("DOMContentLoaded", async () => {
  await getUserData(); // If this populates userCache
  await getBranches(); // Loads branchCache
  await loadRealtors(); // Reads from userCache and renders
});
