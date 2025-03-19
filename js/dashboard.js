import { authorCache } from "./authorCache.js";
import { API_BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#book_details").addEventListener("submit", loadBook);
  document.querySelector("#book_name").addEventListener("input", searchBooks);
  document.querySelector("#add_book").addEventListener("submit", addBook);
  document.querySelector("#add_author").addEventListener("submit", addAuthor);
  document.querySelector("#add_publisher").addEventListener("submit", (event) => {
    console.log("Publisher form submit event triggered");
    addPublisher(event);
  });
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

async function searchBooks(event) {
  const bookNameInput = event.target;
  const bookName = bookNameInput.value.trim();

  if (!bookName) {
    return;
  }

  const apiEndpoint = `${API_BASE_URL}/books?s=${encodeURIComponent(bookName)}`;

  try {
    const response = await fetch(apiEndpoint);

    if (!response.ok) {
      throw new Error(`API Error: Problem fetching data from the api`);
    }

    const books = await response.json();

    if (books.length === 0) {
      throw new Error("No books found with the given name");
    }

    // Populate the datalist with matching books
    const datalist = document.querySelector("#book_dropdown");
    datalist.innerHTML = "";
    books.forEach((book) => {
      const option = document.createElement("option");
      option.value = book.title;
      option.dataset.bookId = book.book_id;
      datalist.appendChild(option);
    });

    // Add event listener to handle book selection
    bookNameInput.addEventListener("change", async () => {
      const selectedBook = books.find(
        (book) => book.title === bookNameInput.value
      );
      if (selectedBook) {
        await displayBookDetails(selectedBook);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function loadBook(event) {
  event.preventDefault();
  const form = event.target;
  const bookNameInput = form.querySelector("#book_name");
  const bookName = bookNameInput.value.trim();
  const errorSpan = bookNameInput.parentElement.querySelector(".error");

  // First clear any previous error states
  form.querySelectorAll(".error").forEach((error) => {
    error.textContent = "";
    error.classList.add("hidden");
  });
  bookNameInput.classList.remove("error-input");

  // Validate the book name field
  if (!bookName) {
    errorSpan.textContent = "Required field";
    errorSpan.classList.remove("hidden");
    bookNameInput.classList.add("error-input");
    return;
  }

  const apiEndpoint = `${API_BASE_URL}/books?s=${encodeURIComponent(bookName)}`;

  try {
    const response = await fetch(apiEndpoint);

    if (!response.ok) {
      throw new Error(`API Error: Problem fetching data from the api`);
    }

    const books = await response.json();

    if (books.length === 0) {
      throw new Error("No books found with the given name");
    }

    // Populate the datalist with matching books
    const datalist = document.querySelector("#book_dropdown");
    datalist.innerHTML = "";
    books.forEach((book) => {
      const option = document.createElement("option");
      option.value = book.title;
      option.dataset.bookId = book.book_id;
      datalist.appendChild(option);
    });

    // Add event listener to handle book selection
    bookNameInput.addEventListener("change", async () => {
      const selectedBook = books.find(
        (book) => book.title === bookNameInput.value
      );
      if (selectedBook) {
        await displayBookDetails(selectedBook);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function displayBookDetails(book) {
  // Update the display with book information
  const response = await fetch(`${API_BASE_URL}/books/${book.book_id}`);
  const data = await response.json();

  document.querySelector(".book_details_container").classList.remove("hidden");
  document.querySelector(".book_details_container").classList.add("flex");
  document.querySelector("title").textContent = book.title;
  document.querySelector("h3").textContent = book.title;
  document.querySelector(".author").textContent = book.author;
  document.querySelector(".publisher").textContent = book.publishing_company;
  document.querySelector(".year").textContent = book.publishing_year;
  
  // Store book ID for loan history
  const loanHistoryBtn = document.querySelector("#show_loan_history");
  loanHistoryBtn.classList.remove("hidden");
  loanHistoryBtn.dataset.bookId = book.book_id;

  // Update the cover image from the API response
  const coverImg = document.querySelector(".cover img");
  coverImg.src =
    data.cover && data.cover.trim() !== "" 
      ? data.cover 
      : "img/placeholder.webp";
  coverImg.alt = `Book cover for ${book.title}`;

  // Remove any existing event listeners before adding a new one
  loanHistoryBtn.replaceWith(loanHistoryBtn.cloneNode(true));
  const newLoanHistoryBtn = document.querySelector("#show_loan_history");

  // Set up loan history button click handler
  newLoanHistoryBtn.addEventListener("click", async () => {
    try {
      // Fetch loan history from admin endpoint
      console.log("Fetching loan history for book ID:", book.book_id);
      const response = await fetch(`${API_BASE_URL}/admin/books/${book.book_id}`);
      if (!response.ok) throw new Error('Failed to fetch loan history');
      
      const bookDetails = await response.json();
      await showLoanHistory(bookDetails.loans || []);
    } catch (error) {
      console.error('Error fetching loan history:', error);
      const dialog = document.querySelector("dialog.loan_history");
      const errorElement = dialog.querySelector(".error");
      errorElement.textContent = "Failed to load loan history. Please try again.";
      errorElement.classList.remove("hidden");
    }
  });

  // Add dialog close button functionality
  const dialog = document.querySelector("dialog.loan_history");
  const closeButton = dialog.querySelector(".close-button");
  closeButton.addEventListener("click", () => {
    dialog.close();
  });
}

async function showLoanHistory(bookLoans) {
  const dialog = document.querySelector("dialog.loan_history");
  const dialogContent = dialog.querySelector(".dialog-content");
  const errorElement = dialog.querySelector(".error");

  // Clear previous content and errors
  dialogContent.innerHTML = "";
  errorElement.textContent = "";
  errorElement.classList.add("hidden");

  if (!bookLoans.length) {
    const noLoansMessage = document.createElement("p");
    noLoansMessage.textContent = "No loan history available for this book.";
    dialogContent.appendChild(noLoansMessage);
    dialog.showModal();
    return;
  }

  // Create loan history list
  const loansList = document.createElement("ul");
  loansList.className = "book_loans";

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

  // Map each loan to a Promise that fetches user name
  const loanElements = await Promise.all(
    bookLoans.reverse().map(async (loan) => {
      const loanItem = document.createElement("li");
      const userName = await getUserName(loan.user_id);
      
      loanItem.innerHTML = `
        <h4>User: ${userName}</h4>
        <p>Loan Date: ${loan.loan_date}</p>
        ${loan.return_date ? `<p>Return Date: ${loan.return_date}</p>` : ''}
      `;
      
      return loanItem;
    })
  );

  // Append all resolved elements
  loanElements.forEach(element => loansList.appendChild(element));
  dialogContent.appendChild(loansList);

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

    // Update the book datalist
    await searchBooks({ target: document.querySelector("#book_name") });
  } catch (error) {
    console.error("Error adding book:", error);
    statusElement.textContent = "Failed to add book. Try again.";
    statusElement.classList.remove("success", "hidden");
    statusElement.classList.add("error");
  }
}

// Update the addAuthor function to ensure the datalist is properly refreshed
async function addAuthor(event) {
  event.preventDefault();
  const form = event.target;
  const statusElement = form.querySelector(".status");
  
  // Get the author name directly from the input fields - using the correct IDs from your HTML
  const firstNameInput = form.querySelector("#add_first_name");
  const lastNameInput = form.querySelector("#add_last_name");
  
  if (!firstNameInput || !lastNameInput) {
    console.error("Author name input fields not found!");
    statusElement.textContent = "Form error: Author name fields not found";
    statusElement.classList.remove("success", "hidden");
    statusElement.classList.add("error");
    return;
  }
  
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const authorName = `${firstName} ${lastName}`;
  
  // Create the FormData for the API request
  const formData = new FormData(form);
  
  try {
    // Log the form data for debugging
    console.log("Submitting author with name:", authorName);
    
    const response = await fetch(`${API_BASE_URL}/admin/authors`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      statusElement.textContent = "Failed to add author. Try again.";
      statusElement.classList.remove("success", "hidden");
      statusElement.classList.add("error");
      throw new Error("Failed to add author");
    }

    // Clear form and show success message
    form.reset();
    statusElement.textContent = "The author was successfully added to the system.";
    statusElement.classList.remove("error", "hidden");
    statusElement.classList.add("success");

    // Create a complete author object with all required fields
    const newAuthor = {
      author_id: data.author_id,
      author_name: authorName,
      first_name: firstName,
      last_name: lastName
    };

    // Update the author cache with the new author
    authorCache.addAuthor(authorName, data.author_id);

    // Update the authors array and repopulate the datalist
    authors.push(newAuthor);
    populateDatalist('author_dropdown', authors, 'author_name');
    
    // Force the search input to recognize the new data
    const authorSearchInput = document.querySelector("#author_search");
    const inputEvent = new Event('input', { bubbles: true });
    authorSearchInput.dispatchEvent(inputEvent);
    
    console.log("Author added successfully:", newAuthor);
  } catch (error) {
    console.error("Error adding author:", error);
    statusElement.textContent = "Failed to add author. Try again.";
    statusElement.classList.remove("success", "hidden");
    statusElement.classList.add("error");
  }
}

// Update the addPublisher function to ensure the datalist is properly refreshed
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

  // Get the publisher name directly from the input field - using the correct ID from your HTML
  const publisherNameInput = form.querySelector("#add_publisher_name");
  
  if (!publisherNameInput) {
    console.error("Publisher name input field not found!");
    statusElement.textContent = "Form error: Publisher name field not found";
    statusElement.classList.remove("success", "hidden");
    statusElement.classList.add("error");
    return;
  }
  
  const publisherName = publisherNameInput.value.trim();
  
  // Create the FormData for the API request
  const formData = new FormData(form);
  
  try {
    // Log the form data for debugging
    console.log("Submitting publisher with name:", publisherName);
    
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

    const data = await response.json();
    
    // Create complete publisher object using the name we got directly
    const newPublisher = {
      publisher_id: data.publisher_id,
      publisher_name: publisherName // This is what will be displayed in the dropdown
    };

    form.reset();
    statusElement.textContent =
      "The publisher was successfully added to the system.";
    statusElement.classList.remove("error", "hidden");
    statusElement.classList.add("success");

    // Update the publishers array and repopulate the datalist
    console.log("Added publisher:", newPublisher);
    publishers.push(newPublisher);
    populateDatalist('publisher_dropdown', publishers, 'publisher_name');
    
    // Force the search input to recognize the new data
    const publisherSearchInput = document.querySelector("#publisher_search");
    const inputEvent = new Event('input', { bubbles: true });
    publisherSearchInput.dispatchEvent(inputEvent);
    
    console.log("Updated publisher array:", publishers);
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
