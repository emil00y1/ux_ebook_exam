export async function fetchBook(book_id) {
    try {
        const response = await fetch(`http://127.0.0.1:8080/books/${book_id}`);
        if (!response.ok) {
            console.error(`Error fetching book with ID ${book_id}: ${response.statusText} (Status: ${response.status})`);
            throw new Error(`Failed to fetch book with ID ${book_id}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching book with ID ${book_id}:`, error);
        throw error;
    }
}
