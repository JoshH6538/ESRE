import { getListings } from "./listing-data.js";

const listingKey = new URLSearchParams(window.location.search).get(
  "listingKey"
);

async function loadListingDetails() {
  const listings = await getListings();
  const listing = listings.find((l) => l.ListingKey === listingKey);

  if (!listing) {
    console.warn("Listing not found for key:", listingKey);
    document.getElementById("listingTitle").textContent = "Listing Not Found";
    return;
  }

  renderListingDetails(listing);
}

function renderListingDetails(listing) {
  // Basic property info
  const address = `${listing.UnparsedAddress || ""}, ${listing.City || ""}`;
  document.getElementById("listingTitle").textContent =
    listing.CountyOrParish || "Property";
  document.getElementById("listingAddress").textContent = address;
  document.getElementById("listingPrice").textContent = `Price: $${
    listing.ListPrice?.toLocaleString() || "N/A"
  }`;

  // Estimated mortgage (very rough)
  const estPrice = listing.ListPrice
    ? Math.floor(listing.ListPrice / (12 * 30))
    : "N/A";
  document.getElementById("estPrice").innerHTML = `
    Est. Payment <span class="fw-500 color-dark">$${estPrice}/mo*</span> 30 years
  `;

  // Property features
  const sqft = listing.LotSizeSquareFeet || "-";
  const beds = listing.BedroomsTotal || "-";
  const baths = listing.BathroomsTotalInteger || "-";
  const type = listing.PropertyType || "-";

  document.querySelector(".property-feature-list ul").innerHTML = `
    <li><span class="fs-20 color-dark">Sqft . ${sqft}</span></li>
    <li><span class="fs-20 color-dark">Bed . ${beds}</span></li>
    <li><span class="fs-20 color-dark">Bath . ${baths}</span></li>
    <li><span class="fs-20 color-dark">Type . ${type}</span></li>
  `;

  // Media carousel
  const carouselInner = document.getElementById("carouselImages");
  const carouselIndicators = document.getElementById("carouselIndicators");

  carouselInner.innerHTML = "";
  carouselIndicators.innerHTML = "";

  (listing.imageUrls || []).forEach((url, index) => {
    const activeClass = index === 0 ? "active" : "";

    carouselInner.innerHTML += `
      <div class="carousel-item ${activeClass}">
        <img src="${url}" alt="Listing image ${
      index + 1
    }" class="border-20 w-100" />
      </div>
    `;

    carouselIndicators.innerHTML += `
      <button 
        type="button" 
        data-bs-target="#media_slider" 
        data-bs-slide-to="${index}" 
        class="${activeClass}" 
        aria-current="${index === 0 ? "true" : "false"}" 
        aria-label="Slide ${index + 1}">
        <img src="${url}" alt="Thumbnail ${
      index + 1
    }" class="border-10 w-100" />
      </button>
    `;
  });
}

document.addEventListener("DOMContentLoaded", loadListingDetails);
