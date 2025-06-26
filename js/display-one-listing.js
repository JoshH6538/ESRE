import { getListings } from "./listing-data.js";

const listingKey = new URLSearchParams(window.location.search).get(
  "listingKey"
);

async function loadListingDetails() {
  const listings = await getListings();
  const listing = listings.find((l) => l.ListingKey === listingKey);

  if (!listing) {
    console.warn("Listing not found for key:", listingKey);
    document.querySelector(".property-titlee").textContent =
      "Listing Not Found";
    return;
  }

  renderListingDetails(listing);
}

function renderListingDetails(listing) {
  // Basic property info
  const address = `${listing.UnparsedAddress || ""}, ${listing.City || ""}`;
  document.querySelector(".property-titlee").textContent =
    listing.CountyOrParish || "Property";
  document.querySelector(
    ".address"
  ).innerHTML = `<i class=\"bi bi-geo-alt\"></i> ${address}`;
  document.querySelector(".price").textContent = `Price: $${
    listing.ListPrice?.toLocaleString() || "N/A"
  }`;

  // Estimated mortgage (very rough)
  const estPrice = listing.ListPrice
    ? Math.floor(listing.ListPrice / (12 * 30))
    : "N/A";
  document.querySelector(".est-price").innerHTML = `
    Est. Payment <span class="fw-500 color-dark">$${estPrice}/mo*</span> 30 years
  `;

  // Property features
  const sqft = listing.LotSizeSquareFeet || "-";
  const beds = listing.BedroomsTotal || "-";
  const baths = listing.BathroomsTotalInteger || "-";
  const type = listing.PropertyType || "-";
  const acres = listing.LotSizeAcres || "-";

  document.querySelector(".property-feature-list ul").innerHTML = `
    <li><img src="images/icon/icon_47.svg" class="icon" /><span class="fs-20 color-dark">Sqft . ${sqft}</span></li>
    <li><img src="images/icon/icon_48.svg" class="icon" /><span class="fs-20 color-dark">Bed . ${beds}</span></li>
    <li><img src="images/icon/icon_49.svg" class="icon" /><span class="fs-20 color-dark">Bath . ${baths}</span></li>
    <li><img src="images/icon/icon_50.svg" class="icon" /><span class="fs-20 color-dark">Type . ${type}</span></li>
  `;

  document.getElementById(
    "seeAllPhotos"
  ).textContent = `See All ${listing.imageUrls.length} Photos`;

  // Media carousel
  const carouselInner = document.querySelector(".carousel-inner");
  const carouselIndicators = document.querySelector(".carousel-indicators");

  carouselInner.innerHTML = "";
  carouselIndicators.innerHTML = "";

  const maxThumbnails = 4;
  const imageUrls = listing.imageUrls || [];

  imageUrls.forEach((url, index) => {
    const activeClass = index === 0 ? "active" : "";

    // Populate only the first 'maxThumbnails' images into the carousel
    if (index < maxThumbnails) {
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
    }
  });

  // Add all images to the hidden fancybox anchors to support full gallery view
  const seeAllBtn = document.querySelector(".img-fancy-btn");
  if (seeAllBtn && imageUrls.length > 0) {
    imageUrls.forEach((url, index) => {
      seeAllBtn.innerHTML += `
        <a href="${url}" class="d-block" data-fancybox="mainImg" data-caption="Listing Image ${
        index + 1
      }"></a>
      `;
    });
  }
  // Overview
  const overview = document.getElementById("property-overview");
  overview.innerHTML = `<h4 class="mb-20">Overview</h4>`;
  overview.innerHTML += `<p class="fs-20 lh-lg">${
    listing.PublicRemarks ??
    "With a passion for real estate and a commitment to personalized service, this agent is dedicated to helping clients find the perfect property — whether buying their first home, upgrading to their next, or making a smart investment. Backed by the trusted team at Equity Smart Real Estate, they bring local market knowledge, professionalism, and a results-driven approach to every transaction. <br> Let their experience work for you."
  }</p>`;

  overview.innerHTML += `
    <div class="property-feature-list mt-40">
      <ul class="style-none d-flex flex-wrap align-items-center justify-content-between">
        <li>
          <img src="images/es/svg/icon_73.svg" alt="" class="lazy-img icon" />
          <span class="fs-20 color-dark">Sqft . ${sqft}</span>
        </li>
        <li>
          <img src="images/icon/icon_51.svg" alt="" class="lazy-img icon" />
          <span class="fs-20 color-dark">Acres . ${acres}</span>
        </li>
        <li>
          <img src="images/icon/icon_48.svg" alt="" class="lazy-img icon" />
          <span class="fs-20 color-dark">Bed . ${beds}</span>
        </li>
        <li>
          <img src="images/icon/icon_49.svg"  alt="" class="lazy-img icon" />
          <span class="fs-20 color-dark">Bath . ${baths}</span>
        </li>

      </ul>
    </div>
  `;

  // Property status
  const status = document.getElementById("propertyStatus");
  status.textContent = listing.MlsStatus || "N/A";
  // Agent Info in Sidebar
  const agentName = listing.ListAgentFullName || "Agent Unavailable";
  const agentEmail = listing.ListAgentEmail || "Not Provided";
  const agentPhone = listing.ListAgentOfficePhone || "N/A";

  // Helper function to populate an agent container
  function populateAgentCard(container) {
    if (!container) return;

    const propertyTitle = listing.CountyOrParish || "Property";
    const address = `${listing.UnparsedAddress || ""}, ${listing.City || ""}`;
    const price = listing.ListPrice
      ? `$${listing.ListPrice.toLocaleString()}`
      : "N/A";
    const link = window.location.href;

    const subject = encodeURIComponent(
      `Inquiry about ${propertyTitle} in ${listing.City}`
    );
    const body = encodeURIComponent(`Hello ${agentName},
  
  I'm interested in the following property:
  
  Address: ${address}
  Price: ${price}
  View Listing: ${link}
  
  Please let me know more details. Thank you!
  `);

    container.innerHTML = `
      <div class="text-center mt-25 xl-mt-20">
        <h6 class="name">${agentName}</h6>
        <p class="fs-16">${
          listing.ListOfficeName ?? "Property Agent & Broker"
        }</p>
      </div>
      <div class="divider-line mt-40 xl-mt-30 mb-45 pt-20">
        <ul class="style-none">
          <li>Email: <span><a href="mailto:${agentEmail}">${agentEmail}</a></span></li>
          <li>Phone: <span><a href="tel:${agentPhone}">${agentPhone}</a></span></li>
        </ul>
      </div>
      <a 
        href="mailto:${agentEmail}?subject=${subject}&body=${body}" 
        class="btn-nine text-uppercase rounded-3 w-100 mb-10">
        Contact Agent
      </a>
    `;
  }

  // Desktop (xl and up)
  populateAgentCard(
    document.querySelector(".theme-sidebar-one.d-none.d-xl-block .agent-info")
  );
  // Mobile (below xl)
  populateAgentCard(document.querySelector(".agent-info.d-xl-none"));
}

document.addEventListener("DOMContentLoaded", loadListingDetails);
