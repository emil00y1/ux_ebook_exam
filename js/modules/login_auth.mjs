document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", handleLoginSubmit);
});

function handleLoginSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  // Reset previous error messages
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));

  // Validation flags
  let isValid = true;

  // Email Validation
  const email = document.getElementById("email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    document.getElementById("email-error").textContent =
      "Please enter a valid email address";
    isValid = false;
  }

  // Password Validation
  const password = document.getElementById("password");
  if (password.value.trim().length < 8) {
    document.getElementById("password-error").textContent =
      "Password must be at least 8 characters long";
    isValid = false;
  }

  // If validation passes, handle the login logic
  if (isValid) {
    const formData = new FormData(document.getElementById("loginForm"));

    // Perform the login using fetch (AJAX request)
    fetch("http://localhost:8080/users/login", {
      method: "POST",
      body: formData, // Send as URL-encoded string
    })
      .then((response) => {
        // Check if response is OK
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text || "Login failed");
          });
        }
        return response.json(); // Parse JSON response
      })
      .then((data) => {
        if (data.user_id) {
          // If user_id exists, login is successful
          const userEmail = document.getElementById("email").value;
          sessionStorage.setItem("userId", data.user_id);
          sessionStorage.setItem("userEmail", userEmail);
          if (userEmail === "admin.library@mail.com") {
            window.location.href = "dashboard.html";
          } else {
            window.location.href = "index.html";
          }
        }
      })
      .catch((error) => {
        // Display error message
        document.getElementById("login-error").textContent =
          "Wrong credentials. Please try again"; // Show error message
      });
  }
}
