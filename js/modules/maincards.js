// main.js
import { fetchBook } from './fetchBook.js';
import { renderBookCard } from './renderCard.js';

async function renderRandomBooks() {
  const container = document.getElementById('cards-container');
  container.innerHTML = ''; // Clear the container

  const book_ids = [];
  while (book_ids.length < 15) {
    const random_id = Math.floor(Math.random() * (1998 - 1001 + 1)) + 1001;
    if (!book_ids.includes(random_id)) {
      book_ids.push(random_id);
    }
  }

  for (const book_id of book_ids) {
    try {
      const book = await fetchBook(book_id);
      const bookCard = renderBookCard(book);
      container.appendChild(bookCard);
    } catch (error) {
      console.error(`Error fetching book with ID ${book_id}:`, error);
    }
  }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  renderRandomBooks();

  // Optional: Add a button to reload random books
  const reloadButton = document.getElementById('reload-button');
  if (reloadButton) {
    reloadButton.addEventListener('click', renderRandomBooks);
  }
});
