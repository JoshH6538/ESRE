import { getListings } from "./listing-data.js";

async function loadListings() {
  const listings = await getListings();
  renderListings(listings);
}

function renderListings(listingArray) {
  const container = document.getElementById("listingContainer");
  container.innerHTML = "";

  if (!Array.isArray(listingArray) || listingArray.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <p class="fs-4 text-muted">No listings found.</p>
      </div>
    `;
    return;
  }

  listingArray.forEach((listing, index) => {
    const delay = (index % 3) * 0.1;
    const col = document.createElement("div");
    col.className = "col-lg-4 col-md-6 mt-40 wow fadeInUp";
    col.setAttribute("data-wow-delay", `${delay}s`);

    const img = listing.imageUrls[0] || "/images/lazy.svg";
    const title = listing.PropertyType || "Property";
    const status = listing.ListingStatus || "AVAILABLE";
    const address = `${listing.UnparsedAddress || ""}, ${listing.City || ""}`;
    const sqft = listing.LivingArea || "-";
    const beds = listing.BedroomsTotal || "-";
    const baths = listing.BathroomsTotalDecimal || "-";
    const price = listing.ListPrice || "N/A";
    const listingKey = listing.ListingKey || "N/A";

    col.innerHTML = `
      <div class="listing-card-four overflow-hidden d-flex align-items-end position-relative z-1" style="background-image: url(${img});">
        <div class="tag fw-500">${status}</div>
        <div class="property-info tran3s w-100">
          <div class="d-flex align-items-center justify-content-between">
            <div class="pe-3">
              <a href="listing_details.html?listingKey=${listingKey}" class="title fw-500 tran4s">$${price}</a>
              <div class="address tran4s">${address}</div>
            </div>
            <a href="listing_details.html?listingKey=${listingKey}" class="btn-four inverse"><i class="bi bi-arrow-up-right"></i></a>
          </div>
          <div class="pl-footer tran4s">
            <ul class="style-none feature d-flex flex-wrap align-items-center justify-content-between">
              <li><strong class="color-dark fw-500">${sqft}</strong><span class="fs-16">sqft</span></li>
              <li><strong class="color-dark fw-500">${beds}</strong><span class="fs-16">bed</span></li>
              <li><strong class="color-dark fw-500">-</strong><span class="fs-16">kitchen</span></li>
              <li><strong class="color-dark fw-500">${baths}</strong><span class="fs-16">bath</span></li>
            </ul>
          </div>
        </div>
      </div>
      
    `;

    container.appendChild(col);
  });

  const exploreButton = document.createElement("div");
  exploreButton.className = "text-center mt-100 md-mt-60";
  exploreButton.innerHTML = `
    <a href="listing_details.html" class="btn-eight">
      <span>Explore All</span> <i class="bi bi-arrow-up-right"></i>
    </a>
  `;
  container.appendChild(exploreButton);
}

// Automatically load listings on page load
document.addEventListener("DOMContentLoaded", loadListings);
