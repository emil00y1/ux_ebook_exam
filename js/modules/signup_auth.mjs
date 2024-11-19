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
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneNumber.value)) {
    document.getElementById("phone_number-error").textContent =
      "Phone number must be 10 digits";
    isValid = false;
  }
  // If all validations pass, allow the form to submit
  if (isValid) {
    // Remove the event listener to prevent re-submission handling
    const form = event.target;
    form.removeEventListener("submit", handleFormSubmit);
    // Submit the form
    form.submit();
  }
}
