import { getListings } from "./listing-data.js";

async function loadListings() {
  let listings = await getListings();
  listings = listings.filter(
    (listing) => listing.MlsStatus?.toLowerCase().trim() !== "closed"
  );
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

  listingArray.slice(0, 8).forEach((listing, index) => {
    const delay = (index % 3) * 0.1;
    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-6 mt-40 wow fadeInUp";
    col.setAttribute("data-wow-delay", `${delay}s`);

    const img = listing.imageUrls[0] || "/images/lazy.svg";
    const title = listing.CountyOrParish || "Property";
    const status = listing.MlsStatus || "N/A";
    const address =
      `${listing.UnparsedAddress || ""}, ${listing.City || ""}, ${
        listing.StateOrProvince || ""
      } ${listing.PostalCode || ""}`.trim() || "Address not available";
    const sqft = listing.LivingArea || "-";
    const acres = listing.LotSizeAcres || "-";
    const beds = listing.BedroomsTotal || "-";
    const baths = listing.BathroomsTotalInteger || "-";
    const price = listing.ListPrice.toLocaleString() || "N/A";
    const listingKey = listing.ListingKey || "N/A";

    col.innerHTML = `
      <div class="listing-card-four overflow-hidden d-flex align-items-end position-relative z-1" style="background-image: url(${img}); object-fit: cover;">
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
              <li><strong class="color-dark fw-500">${acres}</strong><span class="fs-16">acres</span></li>
              <li><strong class="color-dark fw-500">${beds}</strong><span class="fs-16">bed</span></li>
              <li><strong class="color-dark fw-500">${baths}</strong><span class="fs-16">bath</span></li>
            </ul>
          </div>
        </div>
      </div>
      
    `;

    container.appendChild(col);
  });
  // Add view all listings button after the last listing
  const viewAllButton = document.createElement("div");
  viewAllButton.className = "text-center mt-50";
  viewAllButton.innerHTML = `
    <a class="btn-one fw-normal mt-5" id="allListings" href="listings.html">
      View All Listings <i class="bi bi-arrow-right"></i>
    </a>`;
  container.appendChild(viewAllButton);
}

// Automatically load listings on page load
document.addEventListener("DOMContentLoaded", loadListings);
