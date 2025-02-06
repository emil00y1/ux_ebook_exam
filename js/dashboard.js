import { authorCache } from "./authorCache.js";
import { API_BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#book_details").addEventListener("submit", loadBook);
  document.querySelector("#add_book").addEventListener("submit", addBook);
  document.querySelector("#add_author").addEventListener("submit", addAuthor);
  document
    .querySelector("#add_publisher")
    .addEventListener("submit", addPublisher);
  setupTabs();
  // Show first tab by default
  document.querySelector(".tab-button").click();
});

const userEmail = sessionStorage.getItem("userEmail");

if (!userEmail) {
  window.location.href = "login.html";
} else if (userEmail !== "admin.library@mail.com") {
  window.location.href = "index.html";
}

async function loadBook(event) {
  event.preventDefault();
  const form = event.target;
  const bookIdInput = form.querySelector("#book_id");
  const bookId = bookIdInput.value.trim();
  const errorSpan = bookIdInput.parentElement.querySelector(".error");

  // First clear any previous error states
  form.querySelectorAll(".error").forEach((error) => {
    error.textContent = "";
    error.classList.add("hidden");
  });
  bookIdInput.classList.remove("error-input");

  // Validate the book ID field
  if (!bookId) {
    errorSpan.textContent = "Required field";
    errorSpan.classList.remove("hidden");
    bookIdInput.classList.add("error-input");
    return;
  }

  const apiEndpoint = `${API_BASE_URL}/admin/books/${bookId}`;

  try {
    const response = await fetch(apiEndpoint);

    if (!response.ok) {
      // Clear the book display area
      document.querySelector("title").textContent = "";
      document.querySelector("h3").textContent = "";
      document.querySelector(".author").textContent = "";
      document.querySelector(".publisher").textContent = "";
      document.querySelector(".year").textContent = "";
      document.querySelector("#show_loan_history").classList.add("hidden");
      document
        .querySelector(".book_details_container")
        .classList.remove("flex");
      document.querySelector(".book_details_container").classList.add("hidden");
      const coverImg = document.querySelector(".cover img");
      coverImg.src = "";
      coverImg.alt = "";

      throw new Error(`API Error: Problem fetching data from the api`);
    }

    // Clear any previous error messages
    document.querySelector("#content .error").textContent = "";

    const book = await response.json();

    // Update the display with book information
    document
      .querySelector(".book_details_container")
      .classList.remove("hidden");
    document.querySelector(".book_details_container").classList.add("flex");
    document.querySelector("title").textContent = book.title;
    document.querySelector("h3").textContent = book.title;
    document.querySelector(".author").textContent = book.author;
    document.querySelector(".publisher").textContent = book.publishing_company;
    document.querySelector(".year").textContent = book.publishing_year;
    document.querySelector("#show_loan_history").classList.remove("hidden");

    // Update the cover image
    const coverImg = document.querySelector(".cover img");
    coverImg.src =
      book.cover && book.cover.trim() !== ""
        ? book.cover
        : "img/img-placeholder.webp";
    coverImg.alt = `Book cover for ${book.title}`;

    // Set up loan history
    const bookLoans = book.loans.reverse();
    document
      .querySelector("#show_loan_history")
      .addEventListener("click", () => showLoanHistory(bookLoans));
  } catch (error) {
    console.log(error);
    document.querySelector("#content .error").textContent =
      "Could not load the book. Check if the id is correct and try again.";
  }
}

async function getUserName(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);

    if (!response.ok) throw new Error("User not found");
    
    const user = await response.json();
    
    // Combine first and last name (handle missing values)
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
    
    return fullName || `User ${userId}`;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return `User ${userId}`;
  }
}

async function showLoanHistory(bookLoans) {
  const dialog = document.querySelector("dialog");
  const dialogContent = dialog.querySelector(".dialog-content");

  dialogContent.innerHTML = ""; // Clear previous content

  // Map each loan to a Promise that fetches user name
  const loanElements = await Promise.all(
    bookLoans.map(async (loan) => {
      const template = document.getElementById("book_loan_template").content.cloneNode(true);
      const userName = await getUserName(loan.user_id);

      template.querySelector("h4").textContent = `User: ${userName}`;
      template.querySelector("p").textContent = `Loan Date: ${loan.loan_date}`;
      
      return template;
    })
  );

  // Append all resolved elements
  loanElements.forEach(template => dialogContent.appendChild(template));

  dialog.showModal();
}

// Store the fetched data
let authors = [];
let publishers = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch data
    const [authorsResponse, publishersResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/authors`),
      fetch(`${API_BASE_URL}/publishers`)
    ]);

    if (authorsResponse.ok) {
      authors = await authorsResponse.json();
      populateDatalist('author_dropdown', authors, 'author_name');
    }
    
    if (publishersResponse.ok) {
      publishers = await publishersResponse.json();
      populateDatalist('publisher_dropdown', publishers, 'publisher_name');
    }

    // Add input event listeners
    document.querySelector("#author_search").addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = authors.filter(author => 
        author.author_name.toLowerCase().includes(query)
      );
      populateDatalist('author_dropdown', filtered, 'author_name');
    });

    document.querySelector("#publisher_search").addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = publishers.filter(publisher => 
        publisher.publisher_name.toLowerCase().includes(query)
      );
      populateDatalist('publisher_dropdown', filtered, 'publisher_name');
    });

  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

function populateDatalist(datalistId, items, nameField) {
  const datalist = document.querySelector(`#${datalistId}`);
  datalist.innerHTML = "";
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item[nameField];
    datalist.appendChild(option);
  });
}

async function addBook(event) {
  event.preventDefault();
  const form = event.target;
  const statusElement = form.querySelector(".status");

  // Get the entered values
  const authorName = form.querySelector("#author_search").value;
  const publisherName = form.querySelector("#publisher_search").value;

  // Find the corresponding IDs
  const author = authors.find(a => a.author_name === authorName);
  const publisher = publishers.find(p => p.publisher_name === publisherName);

  if (!author || !publisher) {
    statusElement.textContent = "Please select valid author and publisher from the dropdowns";
    statusElement.classList.remove("success", "hidden");
    statusElement.classList.add("error");
    return;
  }

  // Create FormData
  const formData = new FormData(form);
  formData.set('author_id', author.author_id);
  formData.set('publisher_id', publisher.publisher_id);

  try {
    const response = await fetch(`${API_BASE_URL}/admin/books`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to add book");
    }

    form.reset();
    statusElement.textContent = "The book was successfully added to the system.";
    statusElement.classList.remove("error", "hidden");
    statusElement.classList.add("success");
  } catch (error) {
    console.error("Error adding book:", error);
    statusElement.textContent = "Failed to add book. Try again.";
    statusElement.classList.remove("success", "hidden");
    statusElement.classList.add("error");
  }
}

async function addAuthor(event) {
  event.preventDefault();
  const statusElement = event.target.querySelector(".status");
  const formData = new FormData(event.target);

  try {
    const response = await fetch(`${API_BASE_URL}/admin/authors`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      statusElement.textContent = "Failed to add author. Try again.";
      statusElement.classList.remove("success");
      statusElement.classList.add("error");
      throw new Error("Failed to add author");
    }

    // Clear form and show success message
    event.target.reset();
    statusElement.textContent =
      "The author was successfully added to the system.";
    statusElement.classList.remove("error");
    statusElement.classList.add("success");

    // Update the author cache with the new author
    const firstName = formData.get("first_name");
    const lastName = formData.get("last_name");
    const fullName = `${firstName} ${lastName}`;
    authorCache.addAuthor(fullName, data.author_id);
  } catch (error) {
    console.error("Error adding author:", error);
    statusElement.textContent = "Failed to add author. Try again.";
    statusElement.classList.remove("success");
    statusElement.classList.add("error");
  }
}

async function addPublisher(event) {
  event.preventDefault();
  const form = event.target;
  const statusElement = form.querySelector(".status");
  const inputs = form.querySelectorAll("input[required]");
  let hasErrors = false;

  // Clear any previous error states
  form.querySelectorAll(".error").forEach((error) => {
    error.textContent = "";
    error.classList.add("hidden");
  });
  form.querySelectorAll("input").forEach((input) => {
    input.classList.remove("error-input");
  });

  // Validate each required field
  inputs.forEach((input) => {
    if (!input.value.trim()) {
      const errorSpan = input.parentElement.querySelector(".error");
      errorSpan.textContent = "Required field";
      errorSpan.classList.remove("hidden");
      input.classList.add("error-input");
      hasErrors = true;
    }
  });

  if (hasErrors) return;

  const formData = new FormData(form);
  try {
    const response = await fetch(`${API_BASE_URL}/admin/publishers`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      statusElement.textContent = "Failed to add publisher. Try again.";
      statusElement.classList.remove("success", "hidden");
      statusElement.classList.add("error");
      throw new Error("Failed to add publisher");
    }

    form.reset();
    statusElement.textContent =
      "The publisher was successfully added to the system.";
    statusElement.classList.remove("error", "hidden");
    statusElement.classList.add("success");
  } catch (error) {
    console.error("Error adding publisher:", error);
    statusElement.textContent = "Failed to add publisher. Try again.";
    statusElement.classList.remove("success", "hidden");
    statusElement.classList.add("error");
  }
}

// Tab switching functionality
function setupTabs() {
  const tabs = document.querySelectorAll(".tab-button");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      // Clear error states in all forms
      contents.forEach((content) => {
        // Find all error message spans and hide them
        const errorSpans = content.querySelectorAll(".error");
        errorSpans.forEach((span) => {
          span.textContent = "";
          span.classList.add("hidden");
        });

        // Find all status messages and hide them
        const statusSpans = content.querySelectorAll(".status");
        statusSpans.forEach((span) => {
          span.textContent = "";
          span.classList.add("hidden");
        });

        // Remove error styling from all inputs
        const inputs = content.querySelectorAll("input");
        inputs.forEach((input) => {
          input.classList.remove("error-input");
        });

        // Reset the forms themselves
        const form = content.querySelector("form");
        if (form) {
          form.reset();
        }
      });

      // Add active class to clicked tab and corresponding content
      tab.classList.add("active");
      const contentId = tab.getAttribute("data-tab");
      document.querySelector(`#${contentId}`).classList.add("active");
    });
  });
}
