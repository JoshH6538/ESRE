import { findRealtorById } from "./retool-api.js";

const userId = new URLSearchParams(window.location.search).get("userId");
var retryCount = 0;
async function loadUser(userId) {
  console.log("Loading user...");
  var user = await findRealtorById(userId);
  if (!user || user.length === 0 || user["message"]) {
    console.warn("No realtor found or API call failed.");
    console.log("retryCount:", retryCount);
    if (retryCount < 3) {
      // Limit retries to avoid infinite loop
      setTimeout(() => {
        retryCount++;
      }, 5000);
      loadUser(user);
    } // Retry after 5 seconds
  }
  renderUser(user);
  // console.log("User data loaded:", user);
}

async function renderUser(user) {
  const raw = localStorage.getItem("branchCache");
  var branches = new Map();
  if (raw) {
    branches = JSON.parse(raw);
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
              <td>${branches[user["branchId"]]["name"] ?? "N/A"}</td>
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

  const branchName = branches[user.branchId]?.name ?? "Unknown Branch";

  // Set the background image dynamically
  realtorImageWrapper.style.backgroundImage = `url(${iconURL})`;

  // Optional: add a dynamic branch tag inside
  realtorImageWrapper.innerHTML = `
  <div class="tag bg-white position-absolute text-uppercase" style="top: 10px; left: 10px;">
    ${branchName}
  </div>
`;
}

window.addEventListener("DOMContentLoaded", loadUser(userId));
