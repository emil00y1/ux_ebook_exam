// authorCache.js

// Create a class to manage our author cache with methods to handle updates
class AuthorCache {
  constructor() {
    this.authorsMap = null;
  }

  // Initialize or refresh the cache with new author data
  async initialize() {
    try {
      const response = await fetch("http://localhost:8080/authors");
      const authors = await response.json();

      // Create a map for O(1) lookups using author name as key
      this.authorsMap = new Map(
        authors.map((author) => [author.author_name, author.author_id])
      );

      return this.authorsMap;
    } catch (error) {
      console.error("Error initializing author cache:", error);
      return null;
    }
  }

  // Get author ID from name, initializing cache if needed
  async getAuthorId(authorName) {
    if (!this.authorsMap) {
      await this.initialize();
    }
    return this.authorsMap.get(authorName);
  }

  // Add a new author to the cache
  addAuthor(authorName, authorId) {
    if (!this.authorsMap) {
      this.authorsMap = new Map();
    }
    this.authorsMap.set(authorName, authorId);
  }

  // Clear the cache to force a refresh
  clearCache() {
    this.authorsMap = null;
  }
}

// Create and export a single instance to be shared across the application
export const authorCache = new AuthorCache();
