import { validateForm } from "./validators.js";
import { API_BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  form.addEventListener("submit", handleFormSubmit);
});

function handleFormSubmit(event) {
  event.preventDefault();

  // Reset previous error messages
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));

  // Get form data
  const formElements = {
    firstName: document.getElementById("first_name"),
    lastName: document.getElementById("last_name"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    repeatPassword: document.getElementById("repeat-password"),
    address: document.getElementById("address"),
    phone: document.getElementById("phone_number"),
    birthDate: document.getElementById("birth_date"), 
  };

  // Check if all elements were found
  for (const [key, element] of Object.entries(formElements)) {
    if (!element) {
      console.error(`Could not find element with id for ${key}`);
      return;
    }
  }

  // Create validation object using element values
  const formData = {
    firstName: formElements.firstName.value,
    lastName: formElements.lastName.value,
    email: formElements.email.value,
    password: formElements.password.value,
    repeatPassword: formElements.repeatPassword.value,
    address: formElements.address.value,
    phone: formElements.phone.value,
    birthDate: formElements.birthDate.value, 
  };

  // Validate birth date (cannot be in the future)
  const today = new Date().toISOString().split("T")[0];
  if (formData.birthDate > today) {
    document.getElementById("birth_date-error").textContent =
      "Birthdate cannot be in the future.";
    return;
  }

  // Validate form using imported validator
  const { isValid, errors } = validateForm(formData);

  // Display errors if any
  if (!isValid) {
    Object.entries(errors).forEach(([field, error]) => {
      let errorElementId;
      switch (field) {
        case "firstName":
          errorElementId = "first_name-error";
          break;
        case "lastName":
          errorElementId = "last_name-error";
          break;
        case "repeatPassword":
          errorElementId = "repeat-password-error";
          break;
        case "phone":
          errorElementId = "phone_number-error";
          break;
        default:
          errorElementId = `${field}-error`;
      }
      const errorElement = document.getElementById(errorElementId);
      if (errorElement) {
        errorElement.textContent = error;
      }
    });
    return;
  }

  // If validation passes, submit the form
  const formDataToSend = new FormData(event.target);

  fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    body: formDataToSend,
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(text || "Signup failed");
        });
      }
      return response.json();
    })
    .then(() => {
      // Show success message
      document.getElementById("signupForm").innerHTML =
        "<p>Successful! Your account has been created. You'll be redirected shortly.</p>";

      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);
    })
    .catch((error) => {
      console.error(error);
      document.getElementById("login-error").textContent =
        "This email is already in use. Try another.";
    });
}
