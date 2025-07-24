import { addReview, verifyRecaptcha } from "./api.js";
import { getBranches, arrayToMap } from "./branch-data.js";
import { getUserData, getUserReviews } from "./user-data.js";
import { getListings } from "./listing-data.js";

// Grab the userId from the URL query parameters
const userId = new URLSearchParams(window.location.search).get("userId");

// Grab the user from all users cached in localStorage
async function loadUserCached(userId) {
  // console.log("Loading user from cache...");
  // SECTION: Check if userId is valid
  const raw = localStorage.getItem("userCache");
  if (!raw) {
    console.warn("No userCache found.");
    return;
  }
  // SECTION: Parse the userCache
  let userList;
  try {
    userList = JSON.parse(raw); // Expecting an array
  } catch {
    console.error("userCache is corrupted.");
    return;
  }

  // If the cache was saved as an object/map instead of an array, convert it
  const users = Array.isArray(userList) ? userList : Object.values(userList);

  const user = users.find((u) => u.userId === userId);

  if (!user) {
    console.warn(`No user found for ID: ${userId}`);
    return;
  }

  // SECTION: Fetch user reviews
  const reviews = await getUserReviews(userId);

  console.log("User reviews fetched:", reviews);
  if (reviews && reviews.length > 0) {
    user.reviews = reviews;
  } else {
    user.reviews = [];
  }
  // console.log("User found in cache:", user);

  renderUser(user);
}
// SECTION: Populate page with user data
async function renderUser(user) {
  // SECTION: UPDATE SITE TITLE
  document.title = `${user.firstName} ${user.lastName} | ESRE`;

  // SECTION: Prepare data
  const branchArray = await getBranches();
  const branches = arrayToMap(branchArray, "branchId");
  if (!branches || branches.size === 0) {
    console.warn("No branches found or API call failed.");
  }
  // SECTION: Get container and clear previous content
  const container = document.getElementById("userContainer");
  container.innerHTML = ""; // Clear out previous content
  // SECTION: Check if user data is valid
  if (!user || Object.keys(user).length === 0) {
    container.innerHTML = "<p>No user data found.</p>";
    return;
  }
  // SECTION: Define user properties
  const fullName = `${user["firstName"] ?? ""} ${
    user["lastName"] ?? ""
  }`.trim();
  const title = (user["title"] ?? []).join(" / ") || "Agent";
  const branchName = branches.get(user["branchId"])?.name ?? "N/A";

  // SECTION: Build basic info field display
  const fields = [
    { label: "DRE #", value: user["dre"] },
    { label: "Branch", value: branchName },
    { label: "Phone", value: user["primaryPhone"] },
    { label: "Email", value: user["primaryEmail"] },
    { label: "Secondary Phone", value: user["secondaryPhone"] },
    // { label: "Secondary Email", value: user["secondaryEmail"] },
  ];
  // Populate fields with fields array
  const fieldHtml = fields
    .filter(({ value }) => value && value.toString().trim() !== "")
    .map(
      ({ label, value }) => `
        <div class="d-flex mb-2">
          <strong class="me-2">${label}:</strong> <span>${value}</span>
        </div>`
    )
    .join("");

  // SECTION: Render user info into container
  container.innerHTML = `
    <h4>${fullName}</h4>
    <div>${fieldHtml}</div>`;
  // <ul class="style-none d-flex align-items-center social-icon mt-3">
  //   <li><a href="#"><i class="fa-brands fa-whatsapp"></i></a></li>
  //   <li><a href="#"><i class="fa-brands fa-x-twitter"></i></a></li>
  //   <li><a href="#"><i class="fa-brands fa-instagram"></i></a></li>
  //   <li><a href="#"><i class="fa-brands fa-viber"></i></a></li>
  // </ul>

  // SECTION: Add "Apply Now" button if POS URL exists
  // if (user["posURL"]?.trim()) {
  //   const button = document.createElement("button");
  //   button.className = "btn-nine text-uppercase w-100 mb-20 mt-10";
  //   button.textContent = "Apply Now";
  //   button.onclick = () => window.open(user["posURL"], "_blank");
  //   container.appendChild(button);
  // }

  // SECTION: Update breadcrumb name
  const breadcrumb = document.getElementById("breadcrumbRealtorName");
  if (breadcrumb) {
    breadcrumb.innerText = fullName;
  }

  // SECTION: Update image wrapper with profile photo and tag
  const wrapper = document.getElementById("realtorImageWrapper");
  const iconURL =
    user.iconURL?.trim() ||
    "https://equitysmartloans.com/wp-content/uploads/2022/05/placeHolder.jpeg";

  wrapper.style.backgroundImage = `url(${iconURL})`;
  wrapper.style.backgroundSize = "contain";
  wrapper.style.backgroundPosition = "center";

  wrapper.innerHTML = `
    <div class="tag bg-white position-absolute text-uppercase" style="top: 50px; left: 10px;">
      DRE: ${user["dre"] || "NO DRE"} 
    </div>
  `;

  // SECTION: Set bio if available
  const bioContainer = document.getElementById("realtorBio");
  if (bioContainer && user["bio"]?.trim()) {
    bioContainer.innerHTML = user["bio"];
  }

  // SECTION: Add custom "INQUIRY" mail button that CCs another address
  let contactForm = document.getElementById("contactForm");
  const emailToUse =
    user.primaryEmail?.trim() ||
    user.secondaryEmail?.trim() ||
    user.externalEmail?.trim() ||
    null;

  if (emailToUse) {
    const inquiry = document.createElement("button");
    inquiry.className = "btn-nine text-uppercase w-100 mb-20";
    inquiry.textContent = "INQUIRE";
    inquiry.type = "submit"; // Prevent default form behavior

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Stop actual form submission

      const form = e.target;
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const message = form.message.value.trim();

      if (!email || !phone || !message) {
        alert("Please fill out all required fields.");
        return;
      }

      // Choose which user email to use
      const emailToUse =
        user.primaryEmail?.trim() ||
        user.secondaryEmail?.trim() ||
        user.externalEmail?.trim() ||
        null;

      if (!emailToUse) {
        alert("No email address available to send inquiry.");
        return;
      }

      const ccEmail = "ithelp@equitysmartloans.com";
      const subject = `Inquiry for ${user.firstName} ${user.lastName}`;
      const body = `Hello ${user.firstName},\n\n${message}\n\nPhone: ${phone}\nEmail: ${email}\n\nBest regards,`;

      const mailtoURL = `mailto:${emailToUse}?cc=${encodeURIComponent(
        ccEmail
      )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`;

      // console.log("Submitting inquiry via mailto:", mailtoURL);
      window.location.href = mailtoURL;
    });

    contactForm.appendChild(inquiry);
  } else {
    contactForm.innerHTML = "";
  }
  // SECTION: Add custom "CALL NOW" phone button
  const phoneToUse =
    user.primaryPhone?.trim() || user.secondaryPhone?.trim() || null;
  if (phoneToUse) {
    const callButton = document.createElement("button");
    callButton.className = "btn-nine text-uppercase w-100 mb-20";
    callButton.textContent = "CALL NOW";
    callButton.type = "button";

    callButton.onclick = () => {
      const phone = user.primaryPhone.replace(/\D/g, ""); // strip non-digits
      const telURL = `tel:${phone}`;
      // console.log("CALL NOW button clicked:", telURL);
      window.location.href = telURL;
    };

    contactForm.appendChild(callButton);
  }

  // SECTION: Update Realtor Listings
  const listings = await getListings();
  const listingsContainer = document.getElementById("isotop-gallery-wrapper");
  // console.log("Listings loaded:", listings.length);

  // Filter listings for the specific agent
  const userListings = listings.filter((listing) => {
    const agentName = listing.ListAgentFullName?.toLowerCase().trim();
    const agentFirstName = listing.ListAgentFirstName?.toLowerCase().trim();
    const agentLastName = listing.ListAgentLastName?.toLowerCase().trim();

    const userName = fullName.toLowerCase().trim();
    const userFirstName = user.firstName?.toLowerCase().trim();
    const userLastName = user.lastName?.toLowerCase().trim();

    return (
      agentName === userName ||
      (agentFirstName === userFirstName && agentLastName === userLastName) ||
      (agentName.includes(userFirstName) && agentName.includes(userLastName)) ||
      (userName.includes(agentFirstName) && userName.includes(agentLastName))
    );
  });

  // console.log("Filtered user listings:", userListings.length);

  // Clear previous content
  listingsContainer.innerHTML = `<div class="grid-sizer"></div>`;
  if (!userListings?.length) {
    document.getElementById("listingsContainer").classList.add("d-none");
  }
  // Render each listing
  for (const listing of userListings) {
    const listingItem = document.createElement("div");
    listingItem.className = "isotop-item";

    // Add status class
    switch (listing.MlsStatus) {
      case "Active":
        listingItem.classList.add("open");
        break;
      case "Pending":
        listingItem.classList.add("pending");
        break;
      case "Closed":
        listingItem.classList.add("closed");
        break;
    }

    // Build address
    const address = [
      listing.UnparsedAddress,
      listing.City,
      listing.PostalCode,
      listing.StateOrProvince,
    ]
      .filter(Boolean)
      .join(", ");

    // Images
    const images = Array.isArray(listing.imageUrls) ? listing.imageUrls : [];
    const mainImage = images[0] || "images/listing/img_70.jpg";

    // Fancybox group name to avoid cross-mixing galleries
    const fancyGroup = `gallery-${listing.ListingKey}`;

    const sliderAnchors = images
      .map(
        (url) => `
      <a href="${url}" class="d-block" data-fancybox="${fancyGroup}" data-caption="${address}"></a>`
      )
      .join("");

    // Build listing card HTML
    listingItem.innerHTML = `
    <div class="listing-card-one shadow-none style-two mb-50">
      <div class="img-gallery">
        <div class="position-relative overflow-hidden">
          <div class="tag bg-white text-dark fw-500">
            ${listing.MlsStatus || "N/A"}
          </div>
          <img src="${mainImage}" class="w-100" alt="${address}" loading="lazy"/>

          <div class="img-slider-btn">
            ${images.length} <i class="fa-regular fa-image"></i>
            ${sliderAnchors}
          </div>
        </div>
      </div>
      <!-- /.img-gallery -->

      <div class="property-info d-flex justify-content-between align-items-end pt-30">
        <div class ="pe-1">
          <strong class="price fw-500 color-dark">
            $${Number(listing.ListPrice || 0).toLocaleString()}
          </strong>
          <div class="address pt-5 m0">${address}</div>
        </div>
        <a href="listing_details.html?listingKey=${
          listing.ListingKey
        }" class="btn-four mb-5">
          <i class="bi bi-arrow-up-right"></i>
        </a>
      </div>
      <!-- /.property-info -->
    </div>
  `;

    listingsContainer.appendChild(listingItem);
  }
  // SECTION: User Reviews
  const commentsSection = document.getElementById("commentsSection");
  const commentsContainer = document.getElementById("commentsContainer");
  commentsContainer.innerHTML = ""; // Clear previous comments
  const commentsHeader = document.createElement("h3");
  commentsHeader.className = "blog-inner-title pb-35";
  commentsHeader.textContent = `${user.reviews.length} Reviews`;
  const commentForm = document.getElementById("commentForm");
  if (user.reviews.length === 0) {
    commentsContainer.classList.add("d-none", "col-0");
    commentForm.classList.add("col-12");
    commentForm.classList.remove("col-lg-5");
  }
  commentsContainer.appendChild(commentsHeader);
  // SECTION: Render each review
  user.reviews.forEach((review) => {
    const comment = document.createElement("div");
    comment.className = "comment position-relative d-flex mb-30";
    let starsHtml = "";
    for (let i = 1; i <= review.rating; i++) {
      starsHtml += `&#9733;`; // Filled star
    }
    comment.innerHTML = `
      <div class="comment-text">
        <h5 class="mb-10">${review.reviewer}</h5>
        <span class="date">${new Date(
          review.dateSubmitted
        ).toLocaleDateString()}</span>
        <p style="color: #007dab; font-size: 1.5em">${starsHtml}</p>
        <p>${review.message}</p>
      </div>
    `;
    commentsContainer.appendChild(comment);
  });

  // SECTION: Add review form
  const reviewForm = document.getElementById("reviewForm");
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = document.getElementById("submitReviewBtn");

    submitButton.disabled = true; // Disable button to prevent multiple submissions
    submitButton.textContent = "Submitting";
    submitButton.classList.add("inactive-input");
    const loadingImg = document.createElement("img");
    loadingImg.src = "images/lazyBlue.svg";

    document.getElementById("reviewFormSubmission").appendChild(loadingImg);

    const form = e.target;
    const formData = new FormData(form);
    const reviewer = formData.get("reviewer").trim();
    const rating = parseInt(formData.get("rating"), 10);

    const message = formData.get("message").trim();

    try {
      const token = await grecaptcha.execute(
        "6LdMGNspAAAAAI7hAtxj18KrkVYCp-kQq1CPiymO",
        {
          action: "submit_review",
        }
      );
      console.log("reCAPTCHA token received:", token);
      const response = await fetch(
        "https://v3tnqbn900.execute-api.us-east-1.amazonaws.com/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recaptchaToken: token,
            action: "verifyRecaptcha",
          }),
        }
      );

      const result = await response.json();

      if (result.error) {
        alert("reCAPTCHA failed or API error");
      } else {
        await addReview(userId, reviewer, rating, message);
        reviewForm.innerHTML = `
            <p class="text-success">Thank you for your review!</p>
            <p class="text-muted">Your feedback is valuable to us.</p>
          `;
        // Set cooldown for another review submission through cache
        const cooldownTime = 60 * 60 * 1000; // 1 hour in milliseconds
        const cooldownEnd = Date.now() + cooldownTime;
        localStorage.setItem(
          "reviewTimeCache",
          JSON.stringify({ [userId]: cooldownEnd })
        );
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong.");
    }
  });
}

// SECTION: Initialize the page
window.addEventListener("DOMContentLoaded", async () => {
  await getUserData(); // If this populates userCache
  await getBranches(); // Loads branchCache
  await loadUserCached(userId); // Reads from userCache and renders
});
