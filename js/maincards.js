import { API_BASE_URL } from "./config.js";

async function fetchBooks() {
  try {
    const response = await fetch(`${API_BASE_URL}/books?n=15`);
    if (!response.ok) throw new Error("Failed to fetch books");
    return response.json();
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
  template.querySelector(".publishing").textContent = book.publishing_company;
  template.querySelector("h3").textContent = book.title;
  template.querySelector(".author").textContent = `Author: ${book.author}`;
  template.querySelector(
    ".published-year"
  ).textContent = `Published: ${book.publishing_year}`;

  return template;
}

async function renderBooks() {
  const container = document.getElementById("cards-container");
  container.innerHTML = ""; // Clear container
  const books = await fetchBooks();
  books.forEach((book) => container.appendChild(renderBookCard(book)));
}

document.addEventListener("DOMContentLoaded", renderBooks);

async function fetchAuthors() {
  try {
    const response = await fetch(`${API_BASE_URL}/authors`);
    if (!response.ok) throw new Error("Failed to fetch authors");
    const data = await response.json();

    const totalAuthors = data.length;

    const startIndex = Math.floor(Math.random() * (totalAuthors - 15 + 1));

    const randomAuthors = data.slice(startIndex, startIndex + 15);

    return randomAuthors;
  } catch (error) {
    console.error("Error fetching authors:", error);
    return [];
  }
}

function renderAuthorCard(author) {
  const template = document
    .getElementById("author-card-template")
    .content.cloneNode(true);
  template.querySelector("a").href = `author.html?id=${author.author_id}`;
  template.querySelector(".author-name").textContent = author.author_name;
  return template;
}

async function renderAuthors() {
  const container = document.getElementById("authors-container");
  container.innerHTML = ""; // Clear container
  const authors = await fetchAuthors();
  authors.forEach((author) => container.appendChild(renderAuthorCard(author)));
}

document.addEventListener("DOMContentLoaded", renderAuthors);
