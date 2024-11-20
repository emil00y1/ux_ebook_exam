export function renderBookCard(book) {
    // Create main card container
    const card = document.createElement('div');
    card.className = 'card';

    // Card Header (Publisher Name)
    const header = document.createElement('div');
    header.className = 'card-header';
    header.textContent = book.publishing_company;

    // Card Image
    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image';
    const image = document.createElement('img');
    image.src = book.cover || './img/stock-photo.jpg'; // Fallback to default image
    image.alt = `${book.title} cover`;
    imageContainer.appendChild(image);

    // Card Content
    const content = document.createElement('div');
    content.className = 'card-content';

    const title = document.createElement('h3');
    title.textContent = book.title;

    const author = document.createElement('p');
    author.textContent = `Author: ${book.author}`;

    const publishingYear = document.createElement('p');
    publishingYear.textContent = `Published: ${book.publishing_year}`;

    content.appendChild(title);
    content.appendChild(author);
    content.appendChild(publishingYear);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    footer.textContent = 'More info';

    // Combine all parts into the card
    card.appendChild(header);
    card.appendChild(imageContainer);
    card.appendChild(content);
    card.appendChild(footer);

    return card;
}
