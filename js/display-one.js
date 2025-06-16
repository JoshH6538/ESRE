import { findRealtorById } from "./retool-api.js";

const userId = new URLSearchParams(window.location.search).get("userId");

async function loadUser(userId) {
  console.log("Loading user...");
  var user = await findRealtorById(userId);
  user = user[0];
  console.log("User data loaded:", user);
  renderUser(user);
}

async function renderUser(user) {
  const container = document.getElementById("userContainer");
  container.innerHTML = ""; // Clear existing content
  if (!user || Object.keys(user).length === 0) {
    container.innerHTML = "<p>No user data found.</p>";
    return;
  }
  const iconURL =
    user["iconURL"] && user["iconURL"].trim() !== ""
      ? user["iconURL"]
      : "images/lazy.svg";
  container.innerHTML = `
    <h4>${user["firstName"]} ${user["lastName"]}</h4>
                      <div class="designation fs-16">Sales & Broker</div>
                      <div class="table-responsive">
                        <table class="table">
                          <tbody>
                            <tr>
                              <td>Location:</td>
                              <td>Spain, Barcelona</td>
                            </tr>
                            <tr>
                              <td>Phone:</td>
                              <td>+21 456 987 330</td>
                            </tr>
                            <tr>
                              <td>Email:</td>
                              <td>mathfir@support.com</td>
                            </tr>
                            <tr>
                              <td>Qualification:</td>
                              <td>Master Degree</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <ul
                        class="style-none d-flex align-items-center social-icon"
                      >
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
}

window.addEventListener("DOMContentLoaded", loadUser(userId));
