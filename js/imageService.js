/**
 * 4 Pictures 1 Word - Image Service
 * Handles fetching, caching, and managing images from Pixabay API
 */

class ImageService {
    constructor() {
        // Pixabay API key - in production, this should be stored securely
        this.apiKey = "49597101-b3fc3b6e0dd0dea9bdc5208f3"; // Replace with your actual API key
        this.baseUrl = "https://pixabay.com/api/";
        
        // Image cache to avoid repeated API calls
        this.imageCache = {};
        
        // Category-specific search terms to improve image relevance
        this.categorySearchTerms = {
            movies: ["cinema", "film", "movie", "actor", "director", "hollywood"],
            games: ["videogame", "gaming", "game", "console", "controller", "player"],
            sports: ["sport", "athlete", "team", "ball", "competition", "stadium"],
            animals: ["wildlife", "animal", "nature", "pet", "creature", "zoo"],
            food: ["cuisine", "meal", "dish", "restaurant", "cooking", "food"],
            geography: ["landscape", "map", "country", "city", "location", "place"],
            people: ["portrait", "person", "celebrity", "famous", "character", "face"],
            music: ["musician", "instrument", "concert", "band", "singer", "performance"]
        };
        
        // Initialize local storage cache
        this.initLocalStorageCache();
    }
    
    /**
     * Initialize a local storage cache for storing fetched images
     */
    initLocalStorageCache() {
        try {
            // Try to load existing cache
            const cachedImages = localStorage.getItem('4pics1word_image_cache');
            if (cachedImages) {
                this.imageCache = JSON.parse(cachedImages);
                console.log("Loaded image cache from local storage");
            }
        } catch (error) {
            console.error("Error loading image cache:", error);
            this.imageCache = {};
        }
    }
    
    /**
     * Save the current image cache to local storage
     */
    saveCache() {
        try {
            localStorage.setItem('4pics1word_image_cache', JSON.stringify(this.imageCache));
        } catch (error) {
            console.error("Error saving image cache:", error);
        }
    }
    
    /**
     * Get a unique cache key for a word and category
     * @param {string} word - The word to get images for
     * @param {string} category - The category of the word
     * @returns {string} - Cache key
     */
    getCacheKey(word, category) {
        return `${word.toLowerCase()}_${category || 'general'}`;
    }
    
    /**
     * Get enhanced search terms for a word based on category
     * @param {string} word - The base word to search for
     * @param {string} category - The category for context
     * @returns {Array} - Array of search terms
     */
    getSearchTerms(word, category) {
        // Start with the word itself
        const terms = [word];
        
        // Add synonyms or related terms based on the word
        // This could be enhanced with a thesaurus API in production
        
        // Add category-specific terms if available
        if (category && this.categorySearchTerms[category]) {
            terms.push(...this.categorySearchTerms[category]);
        }
        
        return terms;
    }
    
    /**
     * Fetch images for a word from Pixabay
     * @param {string} word - The word to get images for
     * @param {string} category - Optional category for context
     * @returns {Promise<Array>} - Promise resolving to array of image URLs
     */
    async getImagesForWord(word, category = null) {
        const cacheKey = this.getCacheKey(word, category);
        
        // Check cache first
        if (this.imageCache[cacheKey]) {
            console.log(`Using cached images for "${word}"`);
            return this.imageCache[cacheKey];
        }
        
        // Get search terms
        const searchTerms = this.getSearchTerms(word, category);
        
        try {
            // Fetch images from Pixabay for each search term
            const imagePromises = searchTerms.map(term => this.fetchFromPixabay(term));
            const imageResults = await Promise.all(imagePromises);
            
            // Flatten and filter results
            let allImages = [];
            imageResults.forEach(result => {
                if (result && result.hits) {
                    allImages.push(...result.hits.map(hit => hit.webformatURL));
                }
            });
            
            // Remove duplicates and limit to the first 20 unique images
            const uniqueImages = [...new Set(allImages)].slice(0, 20);
            
            // If we have enough images, randomly select 4
            let selectedImages = [];
            if (uniqueImages.length >= 4) {
                selectedImages = this.selectRandomImages(uniqueImages, 4);
            } else if (uniqueImages.length > 0) {
                // If we have some but not enough, use what we have and fill with placeholders
                selectedImages = [
                    ...uniqueImages,
                    ...PLACEHOLDER_IMAGES.slice(0, 4 - uniqueImages.length)
                ];
            } else {
                // Fallback to placeholders if no images found
                selectedImages = PLACEHOLDER_IMAGES;
            }
            
            // Cache the result
            this.imageCache[cacheKey] = selectedImages;
            this.saveCache();
            
            return selectedImages;
        } catch (error) {
            console.error(`Error fetching images for "${word}":`, error);
            return PLACEHOLDER_IMAGES;
        }
    }
    
    /**
     * Fetch images from Pixabay API
     * @param {string} query - Search query
     * @returns {Promise<Object>} - Promise resolving to Pixabay API response
     */
    async fetchFromPixabay(query) {
        try {
            const url = `${this.baseUrl}?key=${this.apiKey}&q=${encodeURIComponent(query)}&image_type=photo&safesearch=true&per_page=10`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching from Pixabay for "${query}":`, error);
            return null;
        }
    }
    
    /**
     * Select random images from an array
     * @param {Array} images - Array of image URLs
     * @param {number} count - Number of images to select
     * @returns {Array} - Selected image URLs
     */
    selectRandomImages(images, count) {
        const selected = [];
        const available = [...images];
        
        for (let i = 0; i < count; i++) {
            if (available.length === 0) break;
            
            const randomIndex = Math.floor(Math.random() * available.length);
            selected.push(available[randomIndex]);
            available.splice(randomIndex, 1);
        }
        
        return selected;
    }
    
    /**
     * Preload images for a puzzle
     * @param {Object} puzzle - Puzzle object with word and category
     * @returns {Promise<void>} - Promise that resolves when preloading is complete
     */
    async preloadPuzzleImages(puzzle) {
        try {
            const word = puzzle.word;
            const category = puzzle.category || null;
            
            const images = await this.getImagesForWord(word, category);
            
            // Preload the images to ensure they're in browser cache
            images.forEach(url => {
                const img = new Image();
                img.src = url;
            });
            
            // Update the puzzle with the image URLs
            puzzle.images = images;
            
            return images;
        } catch (error) {
            console.error(`Error preloading images for puzzle "${puzzle.word}":`, error);
            return PLACEHOLDER_IMAGES;
        }
    }
    
    /**
     * Preload all puzzles in a category
     * @param {string} category - Category name
     * @returns {Promise<void>} - Promise that resolves when preloading is complete
     */
    async preloadCategory(category) {
        if (!PUZZLES[category]) return;
        
        const puzzles = PUZZLES[category];
        
        // Create an array of promises for concurrent loading
        const preloadPromises = puzzles.map(puzzle => this.preloadPuzzleImages({
            ...puzzle,
            category: category
        }));
        
        // Wait for all preloading to complete
        await Promise.all(preloadPromises);
        console.log(`Preloaded images for ${puzzles.length} puzzles in category "${category}"`);
    }
    
    /**
     * Bulk preload images for daily challenges
     * @param {number} days - Number of days to preload
     * @returns {Promise<void>} - Promise that resolves when preloading is complete
     */
    async preloadDailyChallenges(days = 7) {
        const preloadPromises = [];
        
        // Get the current date
        const currentDate = new Date();
        
        // Preload for the specified number of days
        for (let i = 0; i < days; i++) {
            // Create a date object for this day
            const date = new Date(currentDate);
            date.setDate(date.getDate() + i);
            
            // Generate a puzzle for this date (similar to getDailyPuzzle function)
            const dateString = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
            const seed = parseInt(dateString, 10);
            
            // Get all puzzles
            const allPuzzles = [];
            for (const category in PUZZLES) {
                allPuzzles.push(...PUZZLES[category].map(puzzle => ({
                    ...puzzle,
                    category: category
                })));
            }
            
            // Select puzzle based on date
            const randomIndex = seed % allPuzzles.length;
            const dailyPuzzle = allPuzzles[randomIndex];
            
            // Preload this puzzle
            preloadPromises.push(this.preloadPuzzleImages(dailyPuzzle));
        }
        
        // Wait for all preloading to complete
        await Promise.all(preloadPromises);
        console.log(`Preloaded images for daily challenges for the next ${days} days`);
    }
    
    /**
     * Clear the image cache
     */
    clearCache() {
        this.imageCache = {};
        localStorage.removeItem('4pics1word_image_cache');
        console.log("Image cache cleared");
    }
}
