/**
 * 4 Pictures 1 Word - Authentication Service
 * Handles Google Authentication integration
 */

class AuthService {
    constructor() {
        // Google OAuth client ID - replace with your actual client ID
        this.clientId = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
        this.isInitialized = false;
        this.authInstance = null;
        this.currentUser = null;
        
        // Event callbacks
        this.onLoginCallbacks = [];
        this.onLogoutCallbacks = [];
        
        // Initialize once the Google API is loaded
        window.onGoogleAuthLoad = this.initializeGoogleAuth.bind(this);
    }
    
    /**
     * Initialize Google Auth
     */
    async initializeGoogleAuth() {
        try {
            await this.loadGoogleAuthScript();
            
            gapi.load('auth2', () => {
                gapi.auth2.init({
                    client_id: this.clientId,
                    scope: 'profile email'
                }).then(auth => {
                    this.authInstance = auth;
                    this.isInitialized = true;
                    
                    // Check if user is already signed in
                    if (this.authInstance.isSignedIn.get()) {
                        this.currentUser = this.parseUserProfile(this.authInstance.currentUser.get());
                        this.triggerLoginCallbacks(this.currentUser);
                    }
                    
                    // Listen for sign-in state changes
                    this.authInstance.isSignedIn.listen(isSignedIn => {
                        if (isSignedIn) {
                            this.currentUser = this.parseUserProfile(this.authInstance.currentUser.get());
                            this.triggerLoginCallbacks(this.currentUser);
                        } else {
                            this.currentUser = null;
                            this.triggerLogoutCallbacks();
                        }
                    });
                    
                    console.log("Google Auth initialized successfully");
                    
                    // Signal that auth is ready
                    document.dispatchEvent(new Event('googleAuthReady'));
                }).catch(error => {
                    console.error("Error initializing Google Auth:", error);
                });
            });
        } catch (error) {
            console.error("Failed to initialize Google Auth:", error);
        }
    }
    
    /**
     * Load the Google Auth script
     */
    loadGoogleAuthScript() {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            if (document.getElementById('google-auth-script')) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.id = 'google-auth-script';
            script.src = 'https://apis.google.com/js/platform.js?onload=onGoogleAuthLoad';
            script.async = true;
            script.defer = true;
            script.onerror = reject;
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Parse user profile from Google user object
     * @param {Object} googleUser - Google user object
     * @returns {Object} - Parsed user profile
     */
    parseUserProfile(googleUser) {
        if (!googleUser) return null;
        
        const profile = googleUser.getBasicProfile();
        return {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            imageUrl: profile.getImageUrl(),
            token: googleUser.getAuthResponse().id_token
        };
    }
    
    /**
     * Sign in with Google
     * @returns {Promise<Object>} - Promise resolving to user profile
     */
    async signIn() {
        if (!this.isInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            const googleUser = await this.authInstance.signIn();
            this.currentUser = this.parseUserProfile(googleUser);
            return this.currentUser;
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            throw error;
        }
    }
    
    /**
     * Sign out from Google
     * @returns {Promise<void>}
     */
    async signOut() {
        if (!this.isInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            await this.authInstance.signOut();
            this.currentUser = null;
        } catch (error) {
            console.error("Google Sign-Out Error:", error);
            throw error;
        }
    }
    
    /**
     * Wait for Google Auth to initialize
     * @returns {Promise<void>}
     */
    waitForInitialization() {
        return new Promise((resolve) => {
            if (this.isInitialized) {
                resolve();
                return;
            }
            
            document.addEventListener('googleAuthReady', resolve, { once: true });
        });
    }
    
    /**
     * Check if user is currently signed in
     * @returns {boolean} - Whether user is signed in
     */
    isSignedIn() {
        return !!this.currentUser;
    }
    
    /**
     * Get the current user profile
     * @returns {Object|null} - Current user profile or null if not signed in
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Register a callback for successful login
     * @param {Function} callback - Function to call when user logs in
     */
    onLogin(callback) {
        this.onLoginCallbacks.push(callback);
        
        // If already logged in, trigger callback immediately
        if (this.currentUser) {
            callback(this.currentUser);
        }
    }
    
    /**
     * Register a callback for logout
     * @param {Function} callback - Function to call when user logs out
     */
    onLogout(callback) {
        this.onLogoutCallbacks.push(callback);
    }
    
    /**
     * Trigger all login callbacks
     * @param {Object} user - User profile
     * @private
     */
    triggerLoginCallbacks(user) {
        this.onLoginCallbacks.forEach(callback => callback(user));
    }
    
    /**
     * Trigger all logout callbacks
     * @private
     */
    triggerLogoutCallbacks() {
        this.onLogoutCallbacks.forEach(callback => callback());
    }
    
    /**
     * Get user's ID token for backend authentication
     * @returns {string|null} - ID token or null if not signed in
     */
    getIdToken() {
        if (!this.currentUser) return null;
        return this.currentUser.token;
    }
}
