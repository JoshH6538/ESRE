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
  const address = `${listing.UnparsedAddress || ""}, ${listing.City || ""}`;
  document.getElementById("listingTitle").textContent =
    listing.PropertyType || "Property";
  document.getElementById("listingAddress").textContent = `${address || ""}`;
  document.getElementById("listingPrice").textContent = `Price: $${
    listing.ListPrice?.toLocaleString() || "N/A"
  }`;
  const estPrice = listing.ListPrice / (12 * 30); // Assuming 30 years mortgage
  document.getElementById(
    "estPrice"
  ).innerHTML = `  Est. Payment <span class="fw-500 color-dark">$${estPrice}/mo*/ 30 years</span>`;

  const sqft = listing.LivingArea || "-";
  const beds = listing.BedroomsTotal || "-";
  const baths = listing.BathroomsTotalDecimal || "-";
  const type = listing.PropertyType || "-";

  document.querySelector(".property-feature-list ul").innerHTML = `
    <li><span class="fs-20 color-dark">Sqft . ${sqft}</span></li>
    <li><span class="fs-20 color-dark">Bed . ${beds}</span></li>
    <li><span class="fs-20 color-dark">Bath . ${baths}</span></li>
    <li><span class="fs-20 color-dark">Type . ${type}</span></li>
  `;

  const carouselInner = document.getElementById("carouselImages");
  const carouselIndicators = document.getElementById("carouselIndicators");
  carouselInner.innerHTML = "";
  carouselIndicators.innerHTML = "";

  (listing.imageUrls || []).forEach((url, index) => {
    const activeClass = index === 0 ? "active" : "";
    carouselInner.innerHTML += `
      <div class="carousel-item ${activeClass}">
        <img src="${url}" alt="" class="border-20 w-100" />
      </div>`;
    carouselIndicators.innerHTML += `
      <button type="button" data-bs-target="#media_slider" data-bs-slide-to="${index}" class="${activeClass}" aria-current="true" aria-label="Slide ${
      index + 1
    }">
        <img src="${url}" alt="" class="border-10 w-100"/>
      </button>`;
  });
}

document.addEventListener("DOMContentLoaded", loadListingDetails);
