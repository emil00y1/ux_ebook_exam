// Consolidated initialization code
document.addEventListener("DOMContentLoaded", () => {
  // User authentication UI handling
  const userEmail = sessionStorage.getItem("userEmail");
  const loginBtn = document.getElementById("login_btn");
  const signupBtn = document.getElementById("signup_btn");
  const logoutBtn = document.getElementById("logout_btn");
  const profileBtn = document.getElementById("profile_btn");
  const dashboardBtn = document.getElementById("dashboard_btn");

  if (userEmail && userEmail !== "admin.library@mail.com") {
    loginBtn.classList.add("hidden");
    signupBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    profileBtn.classList.remove("hidden");
  } else if (userEmail === "admin.library@mail.com") {
    loginBtn.classList.add("hidden");
    signupBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    profileBtn.classList.remove("hidden");
    dashboardBtn.classList.remove("hidden");
  } else {
    loginBtn.classList.remove("hidden");
    signupBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    profileBtn.classList.add("hidden");
  }

  // Logout functionality
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userId");
  });

  // Search functionality for both mobile and desktop forms
  const searchForms = document.querySelectorAll(".search_form");
  searchForms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const searchQuery = event.target.querySelector("input").value.trim();
      if (searchQuery) {
        window.location.href = `results.html?s=${encodeURIComponent(
          searchQuery
        )}`;
      }
    });
  });

  // Burger menu functionality
  const burgerMenu = document.querySelector(".burger-menu");
  const headerButtons = document.querySelector(".header-buttons");

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  document.body.appendChild(overlay);

  // Toggle menu function
  const toggleMenu = () => {
    burgerMenu.classList.toggle("active");
    headerButtons.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.style.overflow = headerButtons.classList.contains("active")
      ? "hidden"
      : "";
  };

  // Event listeners
  burgerMenu.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", toggleMenu);

  // Close menu when clicking a link
  headerButtons.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (headerButtons.classList.contains("active")) {
        toggleMenu();
      }
    });
  });

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && headerButtons.classList.contains("active")) {
      toggleMenu();
    }
  });
});
