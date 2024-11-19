document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
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

    // If validation passes, send data to the server
    if (isValid) {
      const formData = {
        email: email.value,
        password: password.value,
      };

      // Use fetch to submit the form data to the API
      fetch("/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw err;
            });
          }
          return response.json();
        })
        .then((data) => {
          // If login is successful, store email in sessionStorage and redirect
          sessionStorage.setItem("userEmail", data.email); // Or use the actual returned email
          window.location.href = "/index.html";
        })
        .catch((error) => {
          // Handle API errors, like incorrect credentials
          console.error("Login error:", error);
          if (error.error === "Invalid credentials") {
            alert("Incorrect email or password. Please try again.");
          } else {
            alert("An error occurred. Please try again.");
          }
        });
    }
  });
