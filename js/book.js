import { authorCache } from "./authorCache.js";
import { initializeBackButton } from "./backButton.js";
window.addEventListener("load", fetchBook);
window.addEventListener("load", fetchRecommendedBooks);

const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get("id");
const userEmail = sessionStorage.getItem("userEmail");

document.addEventListener("DOMContentLoaded", () => {
  initializeBackButton();
  if (userEmail === "admin.library@mail.com") {
    document.querySelector("#loan_book").textContent =
      "Sign in as user to loan";
    document.querySelector("#loan_book").classList.add("adm_acc");
  } else {
    document.querySelector("#loan_book").addEventListener("click", loanBook);
  }
  fetchBook();
});

async function fetchBook() {
  if (!bookId) {
    document.querySelector("h1").textContent = "This book can not be found.";
    document.querySelector(
      "#content"
    ).innerHTML = `<p>Try searching for another book or find one from the overview</p>`;
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/books/${bookId}`);
    if (!response.ok) {
      throw new Error(`API Error: Problem fetching data from the api`);
    }

    const book = await response.json();

    // Get the author ID from our cache
    const authorId = await authorCache.getAuthorId(book.author);

    // Update the page content
    document.querySelector("title").textContent = book.title;
    document.querySelector("h1").textContent = book.title;

    // Create author link if we have an ID, otherwise just show the name
    const authorElement = document.querySelector(".author");
    if (authorId) {
      authorElement.innerHTML = `<a href="author.html?id=${authorId}">${book.author}</a>`;
    } else {
      authorElement.textContent = book.author;
    }

    document.querySelector(".publisher").textContent = book.publishing_company;
    document.querySelector(".year").textContent = book.publishing_year;

    const coverImg = document.querySelector(".cover img");
    coverImg.src =
      book.cover && book.cover.trim() !== ""
        ? book.cover
        : "img/placeholder.webp";
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

  if (!userId) {
    window.location.href = "login.html";
    return; // Exit the function early
  }

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
    ).textContent = `You have successfully loaned "${bookTitle}".`;
    document.querySelector(
      ".email-link"
    ).textContent = `An access link will be sent to your email.`;

    dialog.showModal();
  } catch (error) {
    console.error("Error loaning book:", error);
    dialog.classList.remove("success");
    dialog.classList.add("error");
    document.querySelector(
      ".loan-status"
    ).textContent = `You have already loaned "${bookTitle}"`;
    document.querySelector(
      ".email-link"
    ).textContent = `Please check your email for the access link.`;

    dialog.showModal();

    // Handle error appropriately - maybe show an error message to user
  }
}

// Fetch and display recommended books
async function fetchRecommendedBooks() {
  try {
    const response = await fetch("http://localhost:8080/books?n=5");
    if (!response.ok) {
      throw new Error("Failed to fetch recommendations");
    }

    const books = await response.json();
    const recommendationsContainer = document.querySelector(
      ".recommendations-scroll"
    );

    books.forEach((book) => {
      const card = createBookCard(book);
      recommendationsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
  }
}

function createBookCard(book) {
  const template = document.getElementById("book_card_template");
  const card = template.content.cloneNode(true);

  const cardLink = card.querySelector("a");
  const coverImage = card.querySelector("img");
  const titleElement = card.querySelector("h3");
  const authorElement = card.querySelector(".author");

  // Update the elements with book data
  cardLink.href = `book.html?id=${book.book_id}`;
  coverImage.src = book.cover || "img/placeholder.webp";
  coverImage.alt = `Cover of ${book.title}`;
  titleElement.textContent = book.title;
  authorElement.textContent = book.author;

  return card;
}
