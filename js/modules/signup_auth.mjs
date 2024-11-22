document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  form.addEventListener("submit", handleFormSubmit);
});

function handleFormSubmit(event) {
  event.preventDefault();
  // Reset previous error messages
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));

  // Validation flags
  let isValid = true;

  // First Name Validation
  const firstName = document.getElementById("first_name");
  if (firstName.value.trim().length < 2) {
    document.getElementById("first_name-error").textContent =
      "First name must be at least 2 characters long";
    isValid = false;
  }

  // Last Name Validation
  const lastName = document.getElementById("last_name");
  if (lastName.value.trim().length < 2) {
    document.getElementById("last_name-error").textContent =
      "Last name must be at least 2 characters long";
    isValid = false;
  }

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
  const repeatPassword = document.getElementById("repeat-password");
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;

  if (!passwordRegex.test(password.value)) {
    document.getElementById("password-error").textContent =
      "Password must be at least 8 characters, include 1 lowercase, 1 uppercase, 1 number, and 1 special character";
    isValid = false;
  }

  // Repeat Password Validation
  if (password.value !== repeatPassword.value) {
    document.getElementById("repeat-password-error").textContent =
      "Passwords do not match";
    isValid = false;
  }

  // Address Validation
  const address = document.getElementById("address");
  if (address.value.trim().length < 5) {
    document.getElementById("address-error").textContent =
      "Address must be at least 5 characters long";
    isValid = false;
  }

  // Phone Number Validation
  const phoneNumber = document.getElementById("phone_number");
  const phoneRegex = /^\d{8}$/;
  if (!phoneRegex.test(phoneNumber.value)) {
    document.getElementById("phone_number-error").textContent =
      "Phone number must be 8 digits";
    isValid = false;
  }
  if (isValid) {
    const formData = new FormData(document.getElementById("signupForm"));

    fetch("http://localhost:8080/users", {
      method: "POST",
      body: formData, // Send as URL-encoded string
    })
      .then((response) => {
        // Check if response is OK
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text || "Signup failed");
          });
        }
        return response.json(); // Parse JSON response
      })
      .then(() => {
        // If signup is successful, replace the form with success message
        document.getElementById("signupForm").innerHTML =
          "<p>Successful! Your account has been created. You'll be redirected shortly.</p>";

        // Redirect after 5 seconds
        setTimeout(() => {
          window.location.href = "login.html";
        }, 3000);
      })
      .catch((error) => {
        // Display error message
        console.log(error);
        console.log(error.error);
        document.getElementById("login-error").textContent =
          "This email is already in use. Try another."; // Show error message
      });
  }
}
