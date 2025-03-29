/**
 * 4 Pictures 1 Word - Main Application File
 * Handles UI interactions and initializes game components
 */

// Initialize services
const authService = new AuthService();
const imageService = new ImageService();
const gameManager = new GameManager();
const userManager = new UserManager();
const leaderboardManager = new LeaderboardService(authService);

// DOM Elements for navigation
const screens = document.querySelectorAll(".screen");
const dailyChallengeBtn = document.getElementById("daily-challenge");
const categoriesBtn = document.getElementById("categories");
const unlimitedBtn = document.getElementById("unlimited");
const leaderboardBtn = document.getElementById("leaderboard");
const profileBtn = document.getElementById("profile");
const playBtn = document.getElementById("play-btn");
const dailyBtn = document.getElementById("daily-btn");
const hintBtn = document.getElementById("hint-btn");
const skipBtn = document.getElementById("skip-btn");
const backFromCategoryBtn = document.getElementById("back-from-category");
const backFromLeaderboardBtn = document.getElementById("back-from-leaderboard");
const backFromProfileBtn = document.getElementById("back-from-profile");
const loginBtn = document.getElementById("login-btn");
const categoryCards = document.querySelectorAll(".category-card");
const leaderboardTabs = document.querySelectorAll(".tab-btn");
const authModal = document.getElementById("auth-modal");
const authTabs = document.querySelectorAll(".auth-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const gameCompleteModal = document.getElementById("game-complete-modal");
const homeBtn = document.getElementById("home-btn");
const shareBtn = document.getElementById("share-btn");

/**
 * Switch to a specific screen
 * @param {string} screenId - The ID of the screen to show
 */
function showScreen(screenId) {
    // Hide all screens
    screens.forEach(screen => {
        screen.classList.remove("active");
    });
    
    // Show the target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add("active");
    }
}

/**
 * Initialize the application
 */
async function initApp() {
    console.log("Initializing 4 Pictures 1 Word game...");
    
    // Wait for auth service to initialize
    try {
        await authService.waitForInitialization();
        console.log("Auth service initialized");
    } catch (error) {
        console.warn("Auth initialization timed out, continuing with limited functionality");
    }
    
    // Register auth callbacks
    authService.onLogin(user => {
        console.log("User logged in:", user.name);
        userManager.setLoggedInUser(user);
        
        // Update UI to show user is logged in
        document.getElementById("username").textContent = user.name;
        document.getElementById("login-btn").textContent = "Sign Out";
        
        // If we have a profile image, use it
        if (user.imageUrl) {
            const profilePic = document.querySelector(".profile-picture");
            profilePic.innerHTML = `<img src="${user.imageUrl}" alt="${user.name}" />`;
        }
    });
    
    authService.onLogout(() => {
        console.log("User logged out");
        userManager.handleLogout();
        
        // Update UI to show user is logged out
        document.getElementById("username").textContent = "Guest User";
        document.getElementById("login-btn").textContent = "Login / Register";
        
        // Reset profile pic
        const profilePic = document.querySelector(".profile-picture");
        profilePic.innerHTML = `<i class="fas fa-user-circle"></i>`;
    });
    
    // Update login button behavior based on auth
    loginBtn.addEventListener("click", async () => {
        if (authService.isSignedIn()) {
            // Sign out if already signed in
            try {
                await authService.signOut();
                alert("You have been signed out");
            } catch (error) {
                console.error("Error signing out:", error);
                alert("Error signing out. Please try again.");
            }
        } else {
            // Show auth modal for login/register
            authModal.classList.add("active");
        }
    });
    
    // Add Google Sign-In button
    const googleSignInBtn = document.createElement("button");
    googleSignInBtn.className = "google-sign-in-btn";
    googleSignInBtn.innerHTML = `<i class="fab fa-google"></i> Sign in with Google`;
    googleSignInBtn.addEventListener("click", async () => {
        try {
            await authService.signIn();
            authModal.classList.remove("active");
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            alert("Error signing in with Google. Please try again.");
        }
    });
    
    // Add Google button to auth forms
    document.querySelectorAll(".auth-form").forEach(form => {
        const googleBtnContainer = document.createElement("div");
        googleBtnContainer.className = "google-sign-in-container";
        googleBtnContainer.appendChild(googleSignInBtn.cloneNode(true));
        googleBtnContainer.querySelector("button").addEventListener("click", async () => {
            try {
                await authService.signIn();
                authModal.classList.remove("active");
            } catch (error) {
                console.error("Google Sign-In Error:", error);
                alert("Error signing in with Google. Please try again.");
            }
        });
        
        // Add a divider
        const divider = document.createElement("div");
        divider.className = "auth-divider";
        divider.innerHTML = `<span>or</span>`;
        
        form.prepend(divider);
        form.prepend(googleBtnContainer);
    });
    
    // Start preloading images for daily challenges
    imageService.preloadDailyChallenges(7).catch(error => {
        console.warn("Error preloading daily challenges:", error);
    });
    
    // Set up event listeners for navigation and all UI interactions
    dailyChallengeBtn.addEventListener("click", () => {
        showScreen("game-screen");
        gameManager.startGame("daily");
    });
    
    categoriesBtn.addEventListener("click", () => {
        showScreen("category-screen");
    });
    
    unlimitedBtn.addEventListener("click", () => {
        showScreen("game-screen");
        gameManager.startGame("unlimited");
    });
    
    leaderboardBtn.addEventListener("click", () => {
        showScreen("leaderboard-screen");
        leaderboardManager.loadLeaderboard("daily");
    });
    
    profileBtn.addEventListener("click", () => {
        showScreen("profile-screen");
        userManager.updateProfileUI();
    });
    
    playBtn.addEventListener("click", () => {
        showScreen("game-screen");
        gameManager.startGame("unlimited");
    });
    
    dailyBtn.addEventListener("click", () => {
        showScreen("game-screen");
        gameManager.startGame("daily");
    });
    
    hintBtn.addEventListener("click", () => {
        gameManager.useHint();
    });
    
    skipBtn.addEventListener("click", () => {
        gameManager.skipPuzzle();
    });
    
    backFromCategoryBtn.addEventListener("click", () => {
        showScreen("home-screen");
    });
    
    backFromLeaderboardBtn.addEventListener("click", () => {
        showScreen("home-screen");
    });
    
    backFromProfileBtn.addEventListener("click", () => {
        showScreen("home-screen");
    });
    
    homeBtn.addEventListener("click", () => {
        gameCompleteModal.classList.remove("active");
        showScreen("home-screen");
    });
    
    shareBtn.addEventListener("click", () => {
        // Simple sharing functionality (could be expanded)
        try {
            if (navigator.share) {
                navigator.share({
                    title: "4 Pictures 1 Word",
                    text: `I just solved a puzzle in 4 Pictures 1 Word! My score: ${gameManager.score}`,
                    url: window.location.href
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                const shareText = `I just solved a puzzle in 4 Pictures 1 Word! My score: ${gameManager.score}`;
                prompt("Copy this text to share:", shareText);
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    });
    
    // Set up category cards
    categoryCards.forEach(card => {
        card.addEventListener("click", () => {
            const category = card.dataset.category;
            showScreen("game-screen");
            gameManager.startGame("category", category, imageService);
            
            // Start preloading other puzzles in this category
            imageService.preloadCategory(category).catch(error => {
                console.warn(`Error preloading ${category} category:`, error);
            });
        });
    });
    
    // Set up leaderboard tabs
    leaderboardTabs.forEach(tab => {
        tab.addEventListener("click", async () => {
            // Remove active class from all tabs
            leaderboardTabs.forEach(t => t.classList.remove("active"));
            
            // Add active class to clicked tab
            tab.classList.add("active");
            
            // Load the corresponding leaderboard
            const timeframe = tab.dataset.tab;
            try {
                const leaderboardData = await leaderboardManager.getLeaderboard(timeframe);
                updateLeaderboardUI(leaderboardData);
            } catch (error) {
                console.error(`Error loading ${timeframe} leaderboard:`, error);
                const leaderboardContainer = document.getElementById("leaderboard-data");
                leaderboardContainer.innerHTML = `<div class="error-message">Error loading leaderboard. Please try again.</div>`;
            }
        });
    });
    
    // Set up login/register modal
    loginBtn.addEventListener("click", () => {
        authModal.classList.add("active");
    });
    
    // Close modals when clicking the X
    document.querySelectorAll(".close-modal").forEach(closeBtn => {
        closeBtn.addEventListener("click", (e) => {
            e.target.closest(".modal").classList.remove("active");
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            e.target.classList.remove("active");
        }
    });
    
    // Auth tabs
    authTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active class from all tabs
            authTabs.forEach(t => t.classList.remove("active"));
            
            // Add active class to clicked tab
            tab.classList.add("active");
            
            // Show the corresponding form
            const formType = tab.dataset.tab;
            document.getElementById("login-form").classList.remove("active");
            document.getElementById("register-form").classList.remove("active");
            document.getElementById(`${formType}-form`).classList.add("active");
        });
    });
    
    // Login form submission
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
        if (userManager.login(email, password)) {
            authModal.classList.remove("active");
            alert("Logged in successfully!");
        } else {
            alert("Login failed. Please check your credentials.");
        }
    });
    
    // Register form submission
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("register-username").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const confirm = document.getElementById("register-confirm").value;
        
        if (password !== confirm) {
            alert("Passwords do not match!");
            return;
        }
        
        if (userManager.register(username, email, password)) {
            authModal.classList.remove("active");
            alert("Registered successfully!");
        } else {
            alert("Registration failed. Please try again.");
        }
    });
    
    // Add keyboard support for letter selection
    document.addEventListener("keydown", (e) => {
        if (document.getElementById("game-screen").classList.contains("active")) {
            const key = e.key.toUpperCase();
            
            // Check if key is a letter
            if (/^[A-Z]$/.test(key)) {
                // Find letter in letter bank and click it if available
                const letterButtons = document.querySelectorAll(".letter-button:not(.selected)");
                for (const button of letterButtons) {
                    if (button.textContent === key) {
                        button.click();
                        break;
                    }
                }
            }
        }
    });
    
    // Update game completion to submit scores to leaderboard
    gameManager.onGameComplete = async (result, mode, category) => {
        if (result.success) {
            // Update user stats
            userManager.updateStats(true, result.score, result.hintsUsed, result.timeTaken);
            
            // Submit score to leaderboard if user is signed in
            if (authService.isSignedIn()) {
                try {
                    // Determine which leaderboard to submit to
                    let timeframe = 'allTime';
                    if (mode === 'daily') {
                        timeframe = 'daily';
                        await leaderboardManager.submitScore(result.score, timeframe, result.puzzleId);
                    } else {
                        // Submit to both category and all-time leaderboards
                        await leaderboardManager.submitScore(result.score, timeframe);
                        
                        if (category) {
                            // Also submit to category-specific leaderboard if applicable
                            await leaderboardManager.submitScore(result.score, `category_${category}`);
                        }
                    }
                    
                    console.log(`Score submitted to ${timeframe} leaderboard: ${result.score}`);
                } catch (error) {
                    console.error("Error submitting score:", error);
                }
            } else {
                console.log("User not signed in, score not submitted to leaderboard");
            }
        }
        
        // Show completion modal
        showCompletionModal(result);
    };
}

/**
 * Update the leaderboard UI with data
 * @param {Array} leaderboardData - Leaderboard entries
 */
function updateLeaderboardUI(leaderboardData) {
    const leaderboardContainer = document.getElementById("leaderboard-data");
    leaderboardContainer.innerHTML = "";
    
    if (!leaderboardData || leaderboardData.length === 0) {
        leaderboardContainer.innerHTML = `<div class="empty-state">No leaderboard data available</div>`;
        return;
    }
    
    // Create the leaderboard entries
    leaderboardData.forEach(entry => {
        const entryElement = document.createElement("div");
        entryElement.className = "leaderboard-entry";
        
        const rankElement = document.createElement("div");
        rankElement.className = "entry-rank";
        rankElement.textContent = entry.rank;
        
        const userElement = document.createElement("div");
        userElement.className = "entry-user";
        userElement.textContent = entry.username;
        
        const scoreElement = document.createElement("div");
        scoreElement.className = "entry-score";
        scoreElement.textContent = entry.score;
        
        entryElement.appendChild(rankElement);
        entryElement.appendChild(userElement);
        entryElement.appendChild(scoreElement);
        
        // Highlight current user
        if (authService.isSignedIn() && 
            authService.getCurrentUser().name === entry.username) {
            entryElement.classList.add("current-user");
        }
        
        leaderboardContainer.appendChild(entryElement);
    });
}

/**
 * Show the game completion modal with results
 * @param {Object} result - Game result data
 */
function showCompletionModal(result) {
    const modal = document.getElementById("game-complete-modal");
    const resultMessage = document.getElementById("result-message");
    const completionTime = document.getElementById("completion-time");
    const finalScore = document.getElementById("final-score");
    const hintsUsed = document.getElementById("hints-used");
    const nextPuzzleBtn = document.getElementById("next-puzzle-btn");
    
    // Set the result message
    if (result.success) {
        resultMessage.textContent = "Congratulations!";
        const minutes = Math.floor(result.timeTaken / 60);
        const seconds = result.timeTaken % 60;
        completionTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        finalScore.textContent = result.score;
        hintsUsed.textContent = result.hintsUsed;
    } else {
        resultMessage.textContent = "Puzzle Skipped";
        completionTime.textContent = "N/A";
        finalScore.textContent = "0";
        hintsUsed.textContent = result.hintsUsed;
    }
    
    // Setup the next puzzle button
    nextPuzzleBtn.onclick = () => {
        modal.classList.remove("active");
        gameManager.loadNextPuzzle();
    };
    
    // Show the modal
    modal.classList.add("active");
}

// User manager extension to handle Google Auth integration
UserManager.prototype.setLoggedInUser = function(googleUser) {
    // Convert Google user to our format
    this.currentUser = {
        isLoggedIn: true,
        username: googleUser.name,
        email: googleUser.email,
        id: googleUser.id,
        picture: googleUser.imageUrl,
        stats: this.currentUser.stats || {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            bestStreak: 0
        },
        achievements: this.currentUser.achievements || []
    };
    
    // Save and update UI
    this.saveUserData();
    this.updateProfileUI();
};

UserManager.prototype.handleLogout = function() {
    this.currentUser = {
        isLoggedIn: false,
        username: "Guest User",
        stats: {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            bestStreak: 0
        },
        achievements: []
    };
    
    localStorage.removeItem("4pics1word_user");
    this.updateProfileUI();
};

// Initialize app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", initApp);

// Handle service worker for PWA support
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js").then(
            (registration) => {
                console.log("ServiceWorker registration successful with scope: ", registration.scope);
            },
            (error) => {
                console.log("ServiceWorker registration failed: ", error);
            }
        );
    });
}
