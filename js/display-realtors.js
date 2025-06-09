import { allRealtors } from "./retool-api.js";

let allRealtorsData = [];

// This function loads all realtors and renders them on the page
// allRealtorsData is updated with the full list of realtors
async function loadRealtors() {
  console.log("Loading realtors...");
  allRealtorsData = await allRealtors(); // Save the full list
  console.log("Realtors loaded:", allRealtorsData);
  renderRealtors(allRealtorsData);
  updateResultsCount(allRealtorsData.length);
}

function renderRealtors(data) {
  const container = document.getElementById("realtorContainer");
  container.innerHTML = ""; // Clear existing

  //for each realtor, create a column and append it to the container
  data.forEach((realtor) => {
    const col = document.createElement("div");
    col.className = "col-xl-3 col-md-4 col-sm-6";

    col.innerHTML = `
      <div class="agent-card-two position-relative z-1 mb-50 wow fadeInUp">
        <div class="media bg-dark position-relative overflow-hidden">
          <div class="tag bg-white position-absolute text-uppercase">DRE #: ${
            realtor["DRE #"] ?? "DRE #"
          }</div>
          <img src="images/lazy.svg" data-src="images/agent/img_07.jpg" alt="" class="lazy-img agent-img w-100 tran5s">
        </div>
        <div class="text-center pt-30">
          <h6 class="name">
            <a href="agent_details.html">${realtor["First Name"] ?? "First"} ${
      realtor["Last Name"] ?? "Last"
    }</a>
          </h6>
          <div class="designation">${realtor["Title"] ?? "Agent"}</div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
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
    // Combine first name, last name, and convert to lowercase
    const name = `${realtor["First Name"] ?? ""} ${
      realtor["Last Name"] ?? ""
    }`.toLowerCase();

    // Convert DRE # and Zipcode to lowercase
    const dre = (realtor["DRE #"] ?? "").toLowerCase();
    const zip = (realtor["Zipcode"] ?? "").toLowerCase(); // new Zipcode field

    // Return true if any of the fields match the query
    return name.includes(query) || dre.includes(query) || zip.includes(query);
  });
  renderRealtors(filtered);
  //   If no realtors match the search, display a message
  if (filtered.length === 0) {
    const container = document.getElementById("realtorContainer");
    container.innerHTML = "<p>No realtors found.</p>";
  }

  // Update the results count
  updateResultsCount(filtered.length);
});

window.addEventListener("DOMContentLoaded", loadRealtors);
