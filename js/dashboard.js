document.querySelector("#book_details").addEventListener("submit", loadBook);
document.querySelector("#add_book").addEventListener("submit", addBook);
document.querySelector("#add_author").addEventListener("submit", addAuthor);
document
  .querySelector("#add_publisher")
  .addEventListener("submit", addPublisher);
const userEmail = sessionStorage.getItem("userEmail");

if (!userEmail) {
  window.location.href = "login.html";
} else if (userEmail !== "admin.library@mail.com") {
  window.location.href = "index.html";
}

async function loadBook(event) {
  event.preventDefault(); // Prevent default form submission

  const bookId = document.querySelector("#book_id").value;

  const apiEndpoint = `http://localhost:8080/admin/books/${bookId}`;
  try {
    const response = await fetch(apiEndpoint);

    if (!response.ok) {
      document.querySelector("title").textContent = "";
      document.querySelector("h3").textContent = "";
      document.querySelector(".author").textContent = "";
      document.querySelector(".publisher").textContent = "";
      document.querySelector(".year").textContent = "";
      document.querySelector("#show_loan_history").classList.add("hidden");
      const coverImg = document.querySelector(".cover img");
      coverImg.src = "";
      coverImg.alt = ``;
      throw new Error(`API Error: Problem fetching data from the api`);
    }
    document.querySelector("#content .error").textContent = "";

    const book = await response.json();

    document.querySelector("title").textContent = book.title;
    document.querySelector("h3").textContent = book.title;
    document.querySelector(".author").textContent = book.author;
    document.querySelector(".publisher").textContent = book.publishing_company;
    document.querySelector(".year").textContent = book.publishing_year;
    document.querySelector("#show_loan_history").classList.remove("hidden");
    const coverImg = document.querySelector(".cover img");
    coverImg.src =
      book.cover && book.cover.trim() !== ""
        ? book.cover
        : "img/img-placeholder.webp";
    coverImg.alt = `Book cover for ${book.title}`;

    const bookLoans = book.loans.reverse();
    console.log(bookLoans);
    document
      .querySelector("#show_loan_history")
      .addEventListener("click", () => showLoanHistory(bookLoans));
  } catch (error) {
    console.log(error);
    document.querySelector(
      "#content .error"
    ).textContent = `Could not load the book. Check if the id is correct and try again.`;
  }
}

async function showLoanHistory(bookLoans) {
  const dialog = document.querySelector("dialog");
  const closeButton = document.querySelector("dialog button");

  // Clear previous loan entries
  const existingLoans = dialog.querySelectorAll(".loan_entry");
  existingLoans.forEach((entry) => entry.remove());

  closeButton.addEventListener("click", () => {
    dialog.close();
  });

  if (!Array.isArray(bookLoans) || bookLoans.length === 0) {
    document.querySelector(".dialog-content .error").textContent =
      "This book has no loan history";
    dialog.showModal();
    return;
  }

  const dialogContent = dialog.querySelector(".dialog-content");

  bookLoans.forEach((loan) => {
    const template = document
      .getElementById("book_loan_template")
      .content.cloneNode(true);

    template.querySelector("h4").textContent = `User ID: ${loan.user_id}`;
    template.querySelector("p").textContent = `Loan Date: ${loan.loan_date}`;

    dialogContent.appendChild(template);
  });

  dialog.showModal();
}

async function addBook(event) {
  event.preventDefault();

  const publishYear = document.getElementById("add_year").value;

  // Validate year
  const currentYear = new Date().getFullYear();
  if (parseInt(publishYear) > currentYear) {
    document.querySelector(
      "#add_book .error"
    ).textContent = `Publishing year can not be higher than ${currentYear}`;
    return;
  }
  const formData = new FormData(document.querySelector("#add_book"));

  try {
    const response = await fetch("http://localhost:8080/admin/books", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      document.querySelector("#add_book .error").textContent =
        "Failed to add book. Try again.";
      throw new Error("Failed to add book");
    }
    // Clear form on success
    event.target.reset();
    alert("Book added successfully!");
  } catch (error) {
    console.error("Error adding book:", error);
    alert("Failed to add book. Please try again.");
  }
}

async function addAuthor(event) {
  event.preventDefault();

  const formData = new FormData(document.querySelector("#add_author"));
  try {
    const response = await fetch("http://localhost:8080/admin/authors", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      document.querySelector("#add_author .error").textContent =
        "Failed to add author. Try again.";
      throw new Error("Failed to add author");
    }
    // Clear form on success
    event.target.reset();
    alert("author added successfully!");
  } catch (error) {
    console.error("Error adding author:", error);
    alert("Failed to add author. Please try again.");
  }
}
async function addPublisher(event) {
  event.preventDefault();

  const formData = new FormData(document.querySelector("#add_publisher"));
  try {
    const response = await fetch("http://localhost:8080/admin/publishers", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      document.querySelector("#add_publisher .error").textContent =
        "Failed to add publisher. Try again.";
      throw new Error("Failed to add publisher");
    }
    // Clear form on success
    event.target.reset();
    alert("Publisher added successfully!");
  } catch (error) {
    console.error("Error adding publisher:", error);
    alert("Failed to add publisher. Please try again.");
  }
}
