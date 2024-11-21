async function fetchBooks() {
    try {
      const response = await fetch('http://127.0.0.1:8080/books?n=15');
      if (!response.ok) throw new Error('Failed to fetch books');
      return response.json();
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
    }
  }
  
  function renderBookCard(book) {
    const template = document.getElementById('book-card-template').content.cloneNode(true);
  
    template.querySelector('.card-header').textContent = book.publishing_company;
    const image = template.querySelector('.card-image img');
    image.src = book.cover || './img/stock-photo.jpg'; // Fallback image
    image.alt = `${book.title} cover`;
    template.querySelector('h3').textContent = book.title;
    template.querySelector('.author').textContent = `Author: ${book.author}`;
    template.querySelector('.published-year').textContent = `Published: ${book.publishing_year}`;
  
    return template;
  }
  
  async function renderBooks() {
    const container = document.getElementById('cards-container');
    container.innerHTML = ''; // Clear container
    const books = await fetchBooks();
    books.forEach(book => container.appendChild(renderBookCard(book)));
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    renderBooks();
    document.getElementById('reload-button').addEventListener('click', renderBooks);
  });
  