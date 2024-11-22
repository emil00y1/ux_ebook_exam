async function fetchAuthorBooks(authorId) {
  try {
    const response = await fetch(`http://127.0.0.1:8080/books?a=${authorId}`);
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
  template.querySelector("a").href = `book.html?id=${book.book_id}`;
  template.querySelector(".card-header").textContent = book.publishing_company;
  template.querySelector("h3").textContent = book.title;
  template.querySelector(
    ".published-year"
  ).textContent = `Published: ${book.publishing_year}`;
  return template;
}

async function renderAuthorPage() {
  const params = new URLSearchParams(window.location.search);
  const authorId = params.get("id");

  if (!authorId) {
    console.error("Author ID not provided");
    return;
  }

  // Fetch and display the books by the author
  const books = await fetchAuthorBooks(authorId);
  const booksContainer = document.getElementById("books-container");
  booksContainer.innerHTML = ""; // Clear any existing content
  books.forEach((book) => booksContainer.appendChild(renderBookCard(book)));

  // Update the author's name in the header
  const authorName = books.length > 0 ? books[0].author : "Unknown Author";
  document.getElementById("author-name").textContent = authorName;
}

document.addEventListener("DOMContentLoaded", renderAuthorPage);
