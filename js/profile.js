import {
  validateName,
  validateEmail,
  validateAddress,
  validatePhone,
} from "./validators.js";

window.addEventListener("load", fetchUser);
const userId = sessionStorage.getItem("userId");

async function fetchUser() {
  if (!userId) {
    window.location.href = "login.html";
  }

  try {
    const response = await fetch(`http://localhost:8080/users/${userId}`);

    if (!response.ok) {
      throw new Error(`API Error: Problem fetching user from the api`);
    }

    const user = await response.json();

    document.querySelector("h1").textContent = `Hi, ${user.first_name}`;

    document.querySelector("#first_name").value = user.first_name;
    document.querySelector("#last_name").value = user.last_name;
    document.querySelector("#email").value = user.email;
    document.querySelector("#address").value = user.address;
    document.querySelector("#phone_number").value = user.phone_number;
    document.querySelector("#birth_date").value = user.birth_date;
    document.querySelector("#membership_date").textContent =
      user.membership_date;
  } catch (error) {
    console.log(error);
    document.querySelector(
      "#content"
    ).innerHTML = `<p>Could not load your profile. Try again later.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profileForm");
  const errorElements = {};
  const updateStatus = document.querySelector("#update-status");
  const deleteButton = form.querySelector(".delete");
  const deleteModal = document.getElementById("delete-modal");

  // Cache error elements
  [
    "first_name",
    "last_name",
    "email",
    "address",
    "phone_number",
    "login",
  ].forEach((field) => {
    errorElements[field] = document.getElementById(`${field}-error`);
  });

  // Handle delete button click
  deleteButton.addEventListener("click", () => {
    deleteModal.showModal();
  });

  // Handle modal button clicks
  deleteModal.addEventListener("click", async (e) => {
    const target = e.target;

    // Close if clicking backdrop (the dialog element itself)
    if (target === deleteModal) {
      deleteModal.close();
      return;
    }

    if (target.dataset.action === "cancel") {
      deleteModal.close();
    }

    if (target.dataset.action === "confirm") {
      try {
        const response = await fetch(`http://localhost:8080/users/${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Delete failed");
        }

        sessionStorage.clear();
        window.location.href = "index.html";
      } catch (error) {
        updateStatus.textContent = "Delete failed. Please try again.";
        deleteModal.close();
      }
    }
  });

  // Handle escape key for accessibility
  deleteModal.addEventListener("cancel", (e) => {
    e.preventDefault(); // Prevent default escape key behavior
    deleteModal.close();
  });

  // Handle form submission (update only)
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Clear any previous errors
    Object.values(errorElements).forEach((element) => {
      if (element) element.textContent = "";
    });

    const formData = new FormData(form);

    // Get form values
    const fields = {
      firstName: formData.get("first_name"),
      lastName: formData.get("last_name"),
      email: formData.get("email"),
      address: formData.get("address"),
      phone: formData.get("phone_number"),
    };

    // Validate all fields
    const validations = {
      first_name: validateName(fields.firstName),
      last_name: validateName(fields.lastName),
      email: validateEmail(fields.email),
      address: validateAddress(fields.address),
      phone_number: validatePhone(fields.phone),
    };

    // Check if there are any validation errors
    let isValid = true;
    for (const [field, validation] of Object.entries(validations)) {
      if (!validation.isValid) {
        errorElements[field].textContent = validation.error;
        isValid = false;
      }
    }

    if (isValid) {
      try {
        const response = await fetch(`http://localhost:8080/users/${userId}`, {
          method: "PUT",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Profile update failed");
        }

        updateStatus.textContent = "Profile successfully updated!";
      } catch (error) {
        updateStatus.textContent = "An error occurred. Please try again later.";
      }
    }
  });
});
