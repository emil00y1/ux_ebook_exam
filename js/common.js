// Check if the user is logged in
window.addEventListener("DOMContentLoaded", () => {
  const loggedIn = sessionStorage.getItem("userEmail"); // Assuming user_id is stored when logged in
  const loginBtn = document.getElementById("login_btn");
  const signupBtn = document.getElementById("signup_btn");
  const logoutBtn = document.getElementById("logout_btn");
  const profileBtn = document.getElementById("profile_btn");

  if (loggedIn) {
    // If user is logged in, show logout and profile buttons, hide login and signup
    loginBtn.classList.add("hidden");
    signupBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    profileBtn.classList.remove("hidden");
  } else {
    // If user is not logged in, show login and signup buttons, hide logout and profile
    loginBtn.classList.remove("hidden");
    signupBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    profileBtn.classList.add("hidden");
  }
});

document.querySelector("#logout_btn").addEventListener("click", () => {
  sessionStorage.removeItem("userEmail");
  sessionStorage.removeItem("userId");
});

// SEARCH FUNCTION

const searchForm = document.getElementById("search_form");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const searchQuery = document.getElementById("search_field").value.trim();

  if (searchQuery) {
    window.location.href = `/results.html?s=${encodeURIComponent(searchQuery)}`;
  } else {
    return;
  }
});
