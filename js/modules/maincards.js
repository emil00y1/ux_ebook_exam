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
    template.querySelector("a").href = `/book.html?id=${book.book_id}`;
    template.querySelector('.card-header').textContent = book.publishing_company;
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
  
  document.addEventListener('DOMContentLoaded', renderBooks);
  