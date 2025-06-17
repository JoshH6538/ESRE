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
  container.innerHTML = ""; // Clear existing content
  if (!user || Object.keys(user).length === 0) {
    container.innerHTML = "<p>No user data found.</p>";
    return;
  }

  container.innerHTML = `
      <h4>${user["firstName"] ?? ""} ${user["lastName"] ?? ""}</h4>
      <div class="designation fs-16">${
        (user["title"] ?? []).join(" / ") || "Agent"
      }</div>
      <div class="table-responsive">
        <table class="table">
          <tbody>
            <tr>
              <td>DRE #:</td>
              <td>${user["dre"] ?? "N/A"}</td>
            </tr>
            <tr>
              <td>Branch:</td>
              <td>${branches.get(user["branchId"])?.name ?? "N/A"}</td>
            </tr>
            <tr>
              <td>Phone:</td>
              <td>${user["primaryPhone"] ?? "N/A"}</td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>${user["primaryEmail"] ?? "N/A"}</td>
            </tr>
            <tr>
              <td>Secondary Phone:</td>
              <td>${user["secondaryPhone"] ?? "N/A"}</td>
            </tr>
            <tr>
              <td>Secondary Email:</td>
              <td>${user["secondaryEmail"] ?? "N/A"}</td>
            </tr>
            <tr>
              <td>NMLS ID:</td>
              <td>${user["nlms"] ?? "N/A"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <ul class="style-none d-flex align-items-center social-icon">
        <li>
          <a href="#"><i class="fa-brands fa-whatsapp"></i></a>
        </li>
        <li>
          <a href="#"><i class="fa-brands fa-x-twitter"></i></a>
        </li>
        <li>
          <a href="#"><i class="fa-brands fa-instagram"></i></a>
        </li>
        <li>
          <a href="#"><i class="fa-brands fa-viber"></i></a>
        </li>
      </ul>
    `;

  const realtorBreadCrumb = document.getElementById("breadcrumbRealtorName");
  if (realtorBreadCrumb) {
    realtorBreadCrumb.innerHTML = `${user["firstName"] ?? ""} ${
      user["lastName"] ?? ""
    }`;
  }
  const realtorImageWrapper = document.getElementById("realtorImageWrapper");

  const iconURL =
    user.iconURL && user.iconURL.trim() !== ""
      ? user.iconURL
      : "images/lazy.svg";
  if (!user.iconURL || user.iconURL.trim() == "") {
    realtorImageWrapper.classList.add("bg-dark");
  } else {
    realtorImageWrapper.classList.remove("bg-dark");
    realtorImageWrapper.classList.add("bg-white");
  }

  const branchName = branches.get(user.branchId)?.name ?? "Unknown Branch";

  // Set the background image dynamically
  realtorImageWrapper.style.backgroundImage = `url(${iconURL})`;

  // Optional: add a dynamic branch tag inside
  realtorImageWrapper.innerHTML = `
  <div class="tag bg-white position-absolute text-uppercase" style="top: 10px; left: 10px;">
    ${branchName}
  </div>
`;
}

window.addEventListener("DOMContentLoaded", async () => {
  await getUserData(); // If this populates userCache
  await getBranches(); // Loads branchCache
  await loadUserCached(userId); // Reads from userCache and renders
});
