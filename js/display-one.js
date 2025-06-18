import { findRealtorById } from "./retool-api.js";
import { getBranches, arrayToMap } from "./branch-data.js";
import { getUserData } from "./user-data.js";

const userId = new URLSearchParams(window.location.search).get("userId");
// var retryCount = 0;
// async function loadUser(userId) {
//   console.log("Loading user...");
//   var user = await findRealtorById(userId);
//   if (!user || user.length === 0 || user["message"]) {
//     console.warn("No realtor found or API call failed.");
//     console.log("retryCount:", retryCount);
//     if (retryCount < 3) {
//       // Limit retries to avoid infinite loop
//       setTimeout(() => {
//         retryCount++;
//       }, 5000);
//       loadUser(user);
//     } // Retry after 5 seconds
//   }
//   renderUser(user);
//   // console.log("User data loaded:", user);
// }

async function loadUserCached(userId) {
  console.log("Loading user from cache...");

  const raw = localStorage.getItem("userCache");
  if (!raw) {
    console.warn("No userCache found.");
    return;
  }

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

  renderUser(user);
}

async function renderUser(user) {
  const branches = arrayToMap(await getBranches(), "branchId");
  if (!branches || branches.size === 0) {
    console.warn("No branches found or API call failed.");
  }

  const container = document.getElementById("userContainer");
  container.innerHTML = "";

  if (!user || Object.keys(user).length === 0) {
    container.innerHTML = "<p>No user data found.</p>";
    return;
  }

  const fullName = `${user["firstName"] ?? ""} ${
    user["lastName"] ?? ""
  }`.trim();
  const title = (user["title"] ?? []).join(" / ") || "Agent";
  const branchName = branches.get(user["branchId"])?.name ?? "N/A";

  const fields = [
    { label: "DRE #", value: user["dre"] },
    { label: "Branch", value: branchName },
    { label: "Phone", value: user["primaryPhone"] },
    { label: "Email", value: user["primaryEmail"] },
    { label: "Secondary Phone", value: user["secondaryPhone"] },
    { label: "Secondary Email", value: user["secondaryEmail"] },
    { label: "NMLS ID", value: user["nlms"] },
  ];

  const fieldHtml = fields
    .filter(({ value }) => value && value.toString().trim() !== "")
    .map(
      ({ label, value }) => `
        <div class="d-flex mb-2">
          <strong class="me-2">${label}:</strong> <span>${value}</span>
        </div>`
    )
    .join("");

  container.innerHTML = `
    <h4>${fullName}</h4>
    <div class="designation fs-16">${title}</div>
    <div>${fieldHtml}</div>
    <ul class="style-none d-flex align-items-center social-icon mt-3">
      <li><a href="#"><i class="fa-brands fa-whatsapp"></i></a></li>
      <li><a href="#"><i class="fa-brands fa-x-twitter"></i></a></li>
      <li><a href="#"><i class="fa-brands fa-instagram"></i></a></li>
      <li><a href="#"><i class="fa-brands fa-viber"></i></a></li>
    </ul>
  `;

  if (user["posURL"]?.trim()) {
    const button = document.createElement("button");
    button.className = "btn-nine text-uppercase w-100 mb-20";
    button.textContent = "Apply Now";
    button.onclick = () => window.open(user["posURL"], "_blank");
    container.appendChild(button);
  }

  const breadcrumb = document.getElementById("breadcrumbRealtorName");
  if (breadcrumb) breadcrumb.innerText = fullName;

  const wrapper = document.getElementById("realtorImageWrapper");
  const iconURL = user.iconURL?.trim() || "images/lazy.svg";

  wrapper.classList.toggle("bg-dark", !user.iconURL?.trim());
  wrapper.classList.toggle("bg-white", !!user.iconURL?.trim());
  wrapper.style.backgroundImage = `url(${iconURL})`;

  wrapper.innerHTML = `
    <div class="tag bg-white position-absolute text-uppercase" style="top: 10px; left: 10px;">
      ${branchName}
    </div>
  `;

  const bioContainer = document.getElementById("realtorBio");
  if (bioContainer && user["bio"]?.trim()) {
    bioContainer.innerHTML = user["bio"];
  }

  const contactForm = document.getElementById("contactForm");
  let a = document.createElement("a");
  a.className = "btn-eight sm text-uppercase w-100 rounded-0 tran3s";
  a.href = `tel:${user.primaryPhone}`;
  a.textContent = "CALL NOW";
  contactForm.appendChild(a);
}

window.addEventListener("DOMContentLoaded", async () => {
  await getUserData(); // If this populates userCache
  await getBranches(); // Loads branchCache
  await loadUserCached(userId); // Reads from userCache and renders
});
