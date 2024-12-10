import { initializeBackButton } from "./backButton.js";
document.addEventListener("DOMContentLoaded", () => {
  initializeBackButton();
  fetchResults();
});

async function fetchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("s");

  if (!searchQuery) {
    document.querySelector("h1").textContent = "No results";
    document.querySelector(
      "#results"
    ).innerHTML = `<p>The page you are looking for does not exist.</p>`;
    return;
  }

  const apiEndpoint = `http://localhost:8080/books?s=${searchQuery}`;

  try {
    const response = await fetch(apiEndpoint);

    if (!response.ok) {
      throw new Error(`API Error: Problem fetching data from the api`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      document.querySelector("h1").textContent = "No results";
      document.querySelector(
        "#results"
      ).innerHTML = `<p>There are no books with "${searchQuery}" in the name.</p>`;
      return;
    }

    data.forEach((result) => {
      const template = document
        .getElementById("book-card-template")
        .content.cloneNode(true);

      template.querySelector(".card-header .publisher").textContent =
        result.publishing_company;
      template.querySelector("h3").textContent = result.title;
      template.querySelector(".author").textContent = `${result.author}`;
      template.querySelector(
        ".published-year"
      ).textContent = `${result.publishing_year}`;
      template.querySelector("a").href = `book.html?id=${result.book_id}`;
      document.querySelector("#results").appendChild(template);
    });

    document.querySelector("h1").textContent = `Results for "${searchQuery}"`;
  } catch (error) {
    console.log("Search failed", error);
    document.querySelector("h1").textContent = "No results";
    document.querySelector(
      "#results"
    ).innerHTML = `<p>An error occurred while loading the results. Please try again later.</p>`;
  }
}
