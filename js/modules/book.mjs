window.addEventListener("load", fetchBook);
document.querySelector("#loan_book").addEventListener("click", loanBook);

const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get("id");

async function fetchBook() {
  if (!bookId) {
    document.querySelector("h1").textContent = "This book can not be found.";
    document.querySelector(
      "#content"
    ).innerHTML = `<p>Try searching for another book or find one from the overview</p>`;
    return;
  }

  const apiEndpoint = `http://localhost:8080/books/${bookId}`;
  try {
    const response = await fetch(apiEndpoint);

    if (!response.ok) {
      throw new Error(`API Error: Problem fetching data from the api`);
    }

    const book = await response.json();

    document.querySelector("title").textContent = book.title;
    document.querySelector("h1").textContent = book.title;
    document.querySelector(".author").textContent = book.author;
    document.querySelector(".publisher").textContent = book.publishing_company;
    document.querySelector(".year").textContent = book.publishing_year;
    const coverImg = document.querySelector(".cover img");
    coverImg.src =
      book.cover && book.cover.trim() !== ""
        ? book.cover
        : "img/stock-photo.webp";
    coverImg.alt = `Book cover for ${book.title}`;
  } catch (error) {
    console.log(error);
    document.querySelector(
      "#content"
    ).innerHTML = `<p>Could not load the book. Try again later.</p>`;
  }
}

async function loanBook() {
  const userId = sessionStorage.getItem("userId");
  const apiEndpoint = `http://localhost:8080/users/${userId}/books/${bookId}`;
  const dialog = document.querySelector("dialog");
  const closeButton = document.querySelector("dialog button");
  const bookTitle = document.querySelector("h1").textContent;
  closeButton.addEventListener("click", () => {
    dialog.close();
  });

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Loan failed");
    }

    // Only modify DOM if the request was successful

    dialog.classList.remove("error");
    dialog.classList.add("success");
    document.querySelector(
      ".loan-status"
    ).textContent = `You have successfully loaned "${bookTitle}"`;

    dialog.showModal();
  } catch (error) {
    console.error("Error loaning book:", error);
    dialog.classList.remove("success");
    dialog.classList.add("error");
    document.querySelector(
      ".loan-status"
    ).textContent = `You have already loaned "${bookTitle}"`;

    dialog.showModal();

    // Handle error appropriately - maybe show an error message to user
  }
}
