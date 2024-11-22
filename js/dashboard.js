document.querySelector("#book_details").addEventListener("submit", loadBook);
const userId = sessionStorage.getItem("userId");

if (!userId) {
  window.location.href = "login.html";
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

    const bookLoans = book.loans;
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
