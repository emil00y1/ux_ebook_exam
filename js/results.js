import { initializeBackButton } from "./backButton.js";
import { API_BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeBackButton();
  fetchResults();
});

async function fetchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("s");
  
  if (!searchQuery) {
    document.querySelector("h1").textContent = "No results";
    document.querySelector("#results").innerHTML = `<p>The page you are looking for does not exist.</p>`;
    return;
  }
  
  // Show loading indicator
  document.querySelector("#results").innerHTML = `
    <div class="loading-indicator">
      <p>Searching for "${searchQuery}"...</p>
    </div>
  `;
  
  try {
    // First fetch books with the search query
    const booksResponse = await fetch(`${API_BASE_URL}/books?s=${searchQuery}`);
    
    // For authors, fetch all authors and filter client-side
    const authorsResponse = await fetch(`${API_BASE_URL}/authors`);
    
    // Process book results
    let booksData = [];
    if (booksResponse.ok) {
      booksData = await booksResponse.json();
    } else {
      console.error('Failed to fetch books:', booksResponse.status);
    }
    
    // Process author results - fetch all and filter client-side
    let authorsData = [];
    if (authorsResponse.ok) {
      const allAuthors = await authorsResponse.json();
      // Filter authors based on the search query
      authorsData = allAuthors.filter(author => 
        author.author_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      console.error('Failed to fetch authors:', authorsResponse.status);
    }
    
    // Clear loading indicator
    document.querySelector("#results").innerHTML = '';
    
    // Check if we have any results
    if ((!Array.isArray(booksData) || booksData.length === 0) && 
        (!Array.isArray(authorsData) || authorsData.length === 0)) {
      document.querySelector("h1").textContent = "No results";
      document.querySelector("#results").innerHTML = 
        `<p class="no-results">There are no books or authors matching "${searchQuery}".</p>`;
      return;
    }
    
    // Main title for the search
    document.querySelector("h1").textContent = `Results for "${searchQuery}"`;
    
    // Create book section
    if (Array.isArray(booksData) && booksData.length > 0) {
      const bookSection = document.createElement('section');
      bookSection.id = 'book-results';
      bookSection.innerHTML = `<h2>Books (${booksData.length})</h2><div class="results-container"></div>`;
      document.querySelector("#results").appendChild(bookSection);
      
      booksData.forEach((book) => {
        const template = document
          .getElementById("book-card-template")
          .content.cloneNode(true);
        template.querySelector(".card-header .publisher").textContent =
          book.publishing_company;
        template.querySelector("h3").textContent = book.title;
        template.querySelector(".author").textContent = `${book.author}`;
        template.querySelector(".published-year").textContent = `${book.publishing_year}`;
        template.querySelector("a").href = `book.html?id=${book.book_id}`;
        bookSection.querySelector(".results-container").appendChild(template);
      });
    }
    
    // Create author section
    if (Array.isArray(authorsData) && authorsData.length > 0) {
      const authorSection = document.createElement('section');
      authorSection.id = 'author-results';
      authorSection.innerHTML = `<h2>Authors (${authorsData.length})</h2><div class="results-container-authors"></div>`;
      document.querySelector("#results").appendChild(authorSection);
      
      authorsData.forEach((author) => {
        const template = document
          .getElementById("author-card-template")
          .content.cloneNode(true);
        template.querySelector("h3").textContent = author.author_name;
        template.querySelector("a").href = `author.html?id=${author.author_id}`;
        authorSection.querySelector(".results-container-authors").appendChild(template);
      });
    }
    
  } catch (error) {
    console.error("Search failed", error);
    document.querySelector("h1").textContent = "Error";
    document.querySelector("#results").innerHTML = 
      `<p class="error-message">An error occurred while loading the results. Please try again later.</p>`;
  }
}