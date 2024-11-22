window.addEventListener("load", fetchBook);

async function fetchBook() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

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
