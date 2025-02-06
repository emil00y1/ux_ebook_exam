import { initializeBackButton } from "./backButton.js";
import { API_BASE_URL } from "./config.js";


document.addEventListener("DOMContentLoaded", async () => {
  initializeBackButton();
  await renderAuthorPage(); // Added await and () 
});

async function fetchAuthorBooks(authorId) {
  try {
    const response = await fetch(`${API_BASE_URL}/books?a=${authorId}`);
    if (!response.ok) throw new Error("Failed to fetch books");
    return await response.json();
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

function renderBookCard(book) {
  const template = document
    .getElementById("book-card-template")
    .content.cloneNode(true);
    template.querySelector("h3 a").href = `book.html?id=${book.book_id}`;
    template.querySelector(".card-footer a").href = `book.html?id=${book.book_id}`;
  template.querySelector(".card-header").textContent = book.publishing_company;
  template.querySelector("h3").textContent = book.title;
  template.querySelector(".published-year")
    .textContent = `Published: ${book.publishing_year}`;
  return template;
}

async function renderAuthorPage() {
  // Get author ID from URL
  const params = new URLSearchParams(window.location.search);
  const authorId = params.get("id");

  if (!authorId) {
    console.error("No author ID provided");
    return;
  }

  try {
    // Fetch books for this author
    const books = await fetchAuthorBooks(authorId);

    // Get books container
    const booksContainer = document.getElementById("books-container");
    booksContainer.innerHTML = ""; // Clear existing content

    // If no books found
    if (books.length === 0) {
      booksContainer.innerHTML = "<p>No books found for this author.</p>";
      return;
    }

    // Render each book
    books.forEach((book) => {
      const bookCard = renderBookCard(book);
      booksContainer.appendChild(bookCard);
    });

    // Update author name (assuming first book has author details)
    const authorName = books[0].author || "Unknown Author";
    const authorNameElement = document.getElementById("author-name");
    if (authorNameElement) {
      authorNameElement.textContent = authorName;
    }
  } catch (error) {
    console.error("Error rendering author page:", error);
    const booksContainer = document.getElementById("books-container");
    if (booksContainer) {
      booksContainer.innerHTML = "<p>Error loading books.</p>";
    }
  }
}