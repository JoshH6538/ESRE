import { getListings } from "./listing-data.js";

let listingData = [];

async function loadListings() {
  listingData = await getListings();
  listingData = listingData.filter(
    (listing) => listing.MlsStatus?.toLowerCase().trim() !== "closed"
  );
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      console.log("Sort changed to:", sortSelect.value);
      const sorted = sortListings(listingData, sortSelect.value);
      renderListings(sorted);
    });
  }
  listingData = sortListings(listingData, "ListPrice-desc");
  // Check for URL parameters to filter listings
  const countyParam = new URLSearchParams(window.location.search).get("county");
  if (countyParam) {
    console.log("Filtering listings by county:", countyParam);
    listingData = listingData.filter((listing) =>
      listing.CountyOrParish?.toLowerCase().includes(countyParam.toLowerCase())
    );
    const cityInput = document.querySelector('input[name="city"]');
    cityInput.value = countyParam;
    cityInput.readOnly = true;
    cityInput.classList.add("fw-bold");
    const zipcodeInput = document.getElementById("zipcodeInput");
    zipcodeInput.disabled = true;
    document
      .querySelector('input[name="zipcode"]')
      .classList.add("inactive-input");

    const cityListingName = document.getElementById("cityListingName");
    cityListingName.innerHTML = `<p>Listings in <span style="color: #007dab">${countyParam}</span> County</p>`;
    cityListingName.classList.remove("d-none");
  }
  renderListings(listingData);
}

function sortListings(data, sortBy) {
  const [key, order] = sortBy.split("-");
  console.log("-----------------------------------------------");
  return data.slice().sort((a, b) => {
    let valA = a[key];
    let valB = b[key];

    // Handle missing or null values
    if (valA == null)
      valA = order === "asc" ? Number.MAX_VALUE : Number.MIN_VALUE;
    if (valB == null)
      valB = order === "asc" ? Number.MAX_VALUE : Number.MIN_VALUE;

    // Try numeric comparison
    const numA = parseFloat(valA);
    const numB = parseFloat(valB);
    const bothAreNumbers = !isNaN(numA) && !isNaN(numB);
    if (bothAreNumbers) {
      return order === "asc" ? numA - numB : numB - numA;
    }

    // Fallback to string comparison
    const strA = valA.toString().toLowerCase();
    const strB = valB.toString().toLowerCase();
    if (strA < strB) return order === "asc" ? -1 : 1;
    if (strA > strB) return order === "asc" ? 1 : -1;
    return 0;
  });
}

function renderListings(listingArray) {
  const container = document.getElementById("listingContainer");
  container.innerHTML = "";

  if (!Array.isArray(listingArray) || listingArray.length === 0) {
    container.innerHTML = `<div class="text-center py-5">
      <p class="fs-4 text-muted">No listings found.</p>
    </div>`;
    return;
  }

  document.getElementById("listingCount").textContent = listingArray.length;

  listingArray.forEach((listing, index) => {
    const delay = (index % 3) * 0.1;
    const col = document.createElement("div");
    col.className = "col-lg-4 col-md-6 d-flex mb-80 lg-mb-40 wow fadeInUp";
    col.setAttribute("data-wow-delay", `${delay}s`);

    const img = listing.imageUrls?.[0] || "/images/lazy.svg";
    const status = listing.MlsStatus || "N/A";
    const address = `${listing.UnparsedAddress || ""}, ${listing.City || ""}, ${
      listing.StateOrProvince || ""
    } ${listing.PostalCode || ""}`.trim();
    let sqft = listing.LotSizeSquareFeet || "-";
    if (typeof sqft === "number") {
      sqft = Math.round(sqft);
    }
    let sqftDisplay = sqft > 10000 ? `${Math.round(sqft / 1000)}K` : sqft;
    if (sqft > 1000000) sqftDisplay = `${Math.round(sqft / 1000000)}M`;
    let acres = listing.LotSizeAcres || "-";
    if (typeof acres === "number") {
      if (acres < 1) acres = `${acres.toFixed(2)}`;
      else acres = `${Math.round(acres)}`;
    }
    const beds = listing.BedroomsTotal || "-";
    const baths = listing.BathroomsTotalInteger || "-";
    const price = listing.ListPrice
      ? `$${listing.ListPrice.toLocaleString()}`
      : "N/A";
    const listingKey = listing.ListingKey || "";

    col.innerHTML = `
      <div class="listing-card-one style-two shadow-none h-100 w-100">
        <div class="img-gallery">
          <div class="position-relative overflow-hidden">
            <div class="tag fw-500">${status}</div>
            <a href="listing_details.html?listingKey=${listingKey}" class="d-block">
              <img src="${img}" class="w-100" alt="Listing Image" loading="lazy" />
            </a>
          </div>
        </div>
        <div class="property-info pt-20">
          <a href="listing_details.html?listingKey=${listingKey}" class="title tran3s">${address}</a>
          <ul class="style-none feature d-flex flex-wrap align-items-center justify-content-between pb-15 pt-5">
            <li><span class="fs-16"><strong class="color-dark">${sqftDisplay}</strong> sqft</span></li>
            <li><span class="fs-16"><strong class="color-dark">${acres}</strong> acres</span></li>
            <li><span class="fs-16"><strong class="color-dark">${beds}</strong> bed</span></li>
            <li><span class="fs-16"><strong class="color-dark">${baths}</strong> bath</span></li>
          </ul>
          <div class="pl-footer top-border bottom-border d-flex align-items-center justify-content-between">
            <strong class="price fw-500 color-dark">${price}</strong>
            <a href="listing_details.html?listingKey=${listingKey}" class="btn-four">
              <i class="bi bi-arrow-up-right"></i>
            </a>
          </div>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

// City + Zipcode Input Regulation
function validateCityZipInput() {
  const cityInput = document.getElementById("cityInput");
  const zipInput = document.getElementById("zipcodeInput");

  cityInput.addEventListener("keyup", () => {
    if (cityInput.value.length >= 1) {
      zipInput.value = "";
      cityInput.classList.remove("inactive-input");
      zipInput.classList.add("inactive-input");
    }
  });
  zipInput.addEventListener("keyup", () => {
    if (zipInput.value.length >= 1) {
      cityInput.value = "";
      zipInput.classList.remove("inactive-input");
      cityInput.classList.add("inactive-input");
    }
  });
}

// Search Form Submission
document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();

  let filteredListings = listingData.slice();

  // === City Filter ===
  const city = document.querySelector('input[name="city"]').value.trim();
  if (city && city !== "") {
    console.log("Filtering by city:", city);
    filteredListings = filteredListings.filter((listing) =>
      listing.City?.toLowerCase().includes(city.toLowerCase())
    );
  }
  // === Zipcode Filter ===
  const zipcode = parseFloat(
    document.querySelector('input[name="zipcode"]').value.trim()
  );
  if (zipcode && zipcode !== "") {
    console.log("Filtering by zipcode:", zipcode);
    filteredListings = filteredListings.filter((listing) =>
      listing.PostalCode?.toString().includes(zipcode)
    );
  }

  // === Price Filter ===
  const minPrice = parseFloat(
    document.querySelector('input[name="minPrice"]').value
  );
  const maxPrice = parseFloat(
    document.querySelector('input[name="maxPrice"]').value
  );
  if (
    !isNaN(minPrice) &&
    minPrice >= 0 &&
    !isNaN(maxPrice) &&
    maxPrice >= minPrice
  ) {
    console.log("Filtering by price:", minPrice, " to ", maxPrice);
    filteredListings = filteredListings.filter(
      (listing) =>
        listing.ListPrice >= minPrice && listing.ListPrice <= maxPrice
    );
  }
  // === Sqft Filter ===
  const minSqft = parseFloat(document.getElementById("minSqft").value);
  const maxSqft = parseFloat(document.getElementById("maxSqft").value);
  if (!isNaN(minSqft)) {
    console.log("Filtering by min sqft:", minSqft);
    filteredListings = filteredListings.filter(
      (listing) => listing.LotSizeSquareFeet >= minSqft
    );
  }
  if (!isNaN(maxSqft)) {
    console.log("Filtering by max sqft:", maxSqft);
    filteredListings = filteredListings.filter(
      (listing) => listing.LotSizeSquareFeet <= maxSqft
    );
  }

  // === Beds Filter ===
  const bedsInput = document.querySelector('input[name="bedsInput"]').value;
  if (!isNaN(bedsInput) && bedsInput >= 2) {
    console.log("Filtering by beds:", bedsInput);
    filteredListings = filteredListings.filter(
      (listing) => listing.BedroomsTotal >= bedsInput
    );
  }

  // Baths Filter
  const bathsInput = document.querySelector('input[name="bathsInput"]').value;
  if (!isNaN(bathsInput) && bathsInput >= 2) {
    console.log("Filtering by baths:", bathsInput);
    filteredListings = filteredListings.filter(
      (listing) => listing.BathroomsTotalInteger >= bathsInput
    );
  }

  // === Render Filtered Listings ===
  if (filteredListings.length > 0) {
    renderListings(filteredListings);
  } else {
    document.getElementById("listingCount").textContent = "0";
    const container = document.getElementById("listingContainer");
    container.innerHTML = `<div class="text-center py-5">
      <p class="fs-4 text-muted">No listings found for your search criteria.</p>
    </div>`;
  }
});

// Price Range Slider
document
  .querySelector('input[name="minPrice"]')
  .addEventListener("input", (e) => {
    const minPriceRange = document.getElementById("minPriceRange");
    minPriceRange.value = e.target.value;
  });
document
  .querySelector('input[name="maxPrice"]')
  .addEventListener("input", (e) => {
    const maxPriceRange = document.getElementById("maxPriceRange");
    maxPriceRange.value = e.target.value;
  });

document.addEventListener("DOMContentLoaded", () => {
  loadListings();
  validateCityZipInput();
});
