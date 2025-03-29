/**
 * 4 Pictures 1 Word - Leaderboard Service
 * Handles leaderboard data fetching and submission via Cloudflare Workers
 */

class LeaderboardService {
    constructor(authService) {
        // Base URL for API calls - will be the same domain in production
        this.apiBaseUrl = window.location.origin;
        
        // Reference to the authentication service
        this.authService = authService;
        
        // Cache for leaderboard data
        this.leaderboardCache = {
            daily: null,
            weekly: null,
            allTime: null
        };
        
        // Cache expiry times (in milliseconds)
        this.cacheExpiry = {
            daily: 5 * 60 * 1000, // 5 minutes
            weekly: 30 * 60 * 1000, // 30 minutes
            allTime: 60 * 60 * 1000 // 1 hour
        };
        
        // Last fetch timestamps
        this.lastFetch = {
            daily: 0,
            weekly: 0,
            allTime: 0
        };
    }
    
    /**
     * Get authorization headers for API requests
     * @returns {Object} - Headers object with Authorization
     * @private
     */
    _getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add authorization token if user is signed in
        if (this.authService && this.authService.isSignedIn()) {
            const token = this.authService.getIdToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }
    
    /**
     * Check if cached data is still valid
     * @param {string} timeframe - 'daily', 'weekly', or 'allTime'
     * @returns {boolean} - Whether cache is valid
     * @private
     */
    _isCacheValid(timeframe) {
        const now = Date.now();
        return (
            this.leaderboardCache[timeframe] !== null &&
            now - this.lastFetch[timeframe] < this.cacheExpiry[timeframe]
        );
    }
    
    /**
     * Fetch leaderboard data from API
     * @param {string} timeframe - 'daily', 'weekly', or 'allTime'
     * @param {boolean} forceRefresh - Whether to force a refresh ignoring cache
     * @returns {Promise<Array>} - Leaderboard entries
     */
    async getLeaderboard(timeframe, forceRefresh = false) {
        // Normalize timeframe
        const normalizedTimeframe = timeframe === 'all-time' ? 'allTime' : timeframe;
        
        // Check cache first
        if (!forceRefresh && this._isCacheValid(normalizedTimeframe)) {
            console.log(`Using cached ${normalizedTimeframe} leaderboard`);
            return this.leaderboardCache[normalizedTimeframe];
        }
        
        try {
            // Fetch from API
            const response = await fetch(
                `${this.apiBaseUrl}/api/leaderboard/${normalizedTimeframe}`,
                {
                    method: 'GET',
                    headers: this._getAuthHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update cache
            this.leaderboardCache[normalizedTimeframe] = data;
            this.lastFetch[normalizedTimeframe] = Date.now();
            
            return data;
        } catch (error) {
            console.error(`Error fetching ${normalizedTimeframe} leaderboard:`, error);
            
            // If we have cached data, return that instead
            if (this.leaderboardCache[normalizedTimeframe]) {
                console.log(`Falling back to cached ${normalizedTimeframe} leaderboard`);
                return this.leaderboardCache[normalizedTimeframe];
            }
            
            // Otherwise, return empty array
            return [];
        }
    }
    
    /**
     * Submit a score to the leaderboard
     * @param {number} score - The score to submit
     * @param {string} timeframe - 'daily', 'weekly', or 'allTime'
     * @param {string} puzzleId - Optional puzzle ID for daily challenges
     * @returns {Promise<Object>} - Response data
     */
    async submitScore(score, timeframe, puzzleId = null) {
        // Check if user is signed in
        if (!this.authService || !this.authService.isSignedIn()) {
            throw new Error('User must be signed in to submit scores');
        }
        
        // Normalize timeframe
        const normalizedTimeframe = timeframe === 'all-time' ? 'allTime' : timeframe;
        
        try {
            // Build payload
            const payload = {
                score: score,
                puzzleId: puzzleId
            };
            
            // Submit to API
            const response = await fetch(
                `${this.apiBaseUrl}/api/leaderboard/${normalizedTimeframe}`,
                {
                    method: 'POST',
                    headers: this._getAuthHeaders(),
                    body: JSON.stringify(payload)
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Invalidate cache for this timeframe
            this.leaderboardCache[normalizedTimeframe] = null;
            
            return data;
        } catch (error) {
            console.error(`Error submitting score to ${normalizedTimeframe} leaderboard:`, error);
            throw error;
        }
    }
    
    /**
     * Get the user's position on a leaderboard
     * @param {string} timeframe - 'daily', 'weekly', or 'allTime'
     * @returns {Promise<Object|null>} - User's rank info or null if not found
     */
    async getUserRank(timeframe) {
        // Check if user is signed in
        if (!this.authService || !this.authService.isSignedIn()) {
            return null;
        }
        
        // Normalize timeframe
        const normalizedTimeframe = timeframe === 'all-time' ? 'allTime' : timeframe;
        
        try {
            // Get user profile
            const user = this.authService.getCurrentUser();
            
            // Fetch leaderboard
            const leaderboard = await this.getLeaderboard(normalizedTimeframe);
            
            // Find user in leaderboard
            const userEntry = leaderboard.find(entry => 
                entry.userId === user.id || entry.username === user.name
            );
            
            return userEntry || null;
        } catch (error) {
            console.error(`Error getting user rank for ${normalizedTimeframe}:`, error);
            return null;
        }
    }
    
    /**
     * Clear all cached leaderboard data
     */
    clearCache() {
        this.leaderboardCache = {
            daily: null,
            weekly: null,
            allTime: null
        };
        
        this.lastFetch = {
            daily: 0,
            weekly: 0,
            allTime: 0
        };
        
        console.log('Leaderboard cache cleared');
    }
}
