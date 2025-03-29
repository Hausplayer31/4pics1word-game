/**
 * 4 Pictures 1 Word - Game Logic
 * Handles the core game functionality, puzzle generation, and scoring
 */

class GameManager {
    constructor() {
        // Game state
        this.currentPuzzle = null;
        this.currentCategory = null;
        this.currentWord = "";
        this.userGuess = [];
        this.letterBank = [];
        this.hintsUsed = 0;
        this.startTime = 0;
        this.gameTimer = null;
        this.elapsedTime = 0;
        this.score = 0;
        this.gameMode = ""; // "daily", "category", or "unlimited"
        
        // References to DOM elements
        this.wordDisplay = document.getElementById("word-display");
        this.letterBankElement = document.getElementById("letter-bank");
        this.imageElements = [
            document.getElementById("image1"),
            document.getElementById("image2"),
            document.getElementById("image3"),
            document.getElementById("image4")
        ];
        this.scoreElement = document.getElementById("score-value");
        this.levelElement = document.getElementById("level-value");
        this.timerElement = document.getElementById("timer-value");
        this.feedbackElement = document.getElementById("feedback-message");
        this.gameModeElement = document.getElementById("game-mode");
    }

    /**
     * Initialize a new game in the specified mode
     * @param {string} mode - Game mode: "daily", "category", or "unlimited"
     * @param {string} category - Category for category mode
     */
    startGame(mode, category = null) {
        this.gameMode = mode;
        this.currentCategory = category;
        this.score = 0;
        this.updateScoreDisplay();
        
        // Set the displayed game mode
        if (mode === "daily") {
            this.gameModeElement.textContent = "Daily Challenge";
        } else if (mode === "category" && category) {
            this.gameModeElement.textContent = CATEGORIES[category].name;
        } else {
            this.gameModeElement.textContent = "Unlimited";
        }
        
        this.loadNextPuzzle();
    }

    /**
     * Load a new puzzle based on the current game mode
     */
    loadNextPuzzle() {
        // Reset game state for new puzzle
        clearInterval(this.gameTimer);
        this.hintsUsed = 0;
        this.userGuess = [];
        this.elapsedTime = 0;
        
        // Get a puzzle based on the game mode
        if (this.gameMode === "daily") {
            this.currentPuzzle = getDailyPuzzle();
        } else if (this.gameMode === "category" && this.currentCategory) {
            const categoryPuzzles = PUZZLES[this.currentCategory];
            if (categoryPuzzles && categoryPuzzles.length > 0) {
                const randomIndex = Math.floor(Math.random() * categoryPuzzles.length);
                this.currentPuzzle = categoryPuzzles[randomIndex];
            } else {
                this.showError("No puzzles available in this category.");
                return;
            }
        } else {
            // Unlimited mode - random from all categories
            const allCategories = Object.keys(PUZZLES);
            const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
            const categoryPuzzles = PUZZLES[randomCategory];
            const randomIndex = Math.floor(Math.random() * categoryPuzzles.length);
            this.currentPuzzle = categoryPuzzles[randomIndex];
        }
        
        // Update the level display
        this.levelElement.textContent = this.currentPuzzle.difficulty;
        
        // Setup the puzzle in the UI
        this.setupPuzzle();
    }

    /**
     * Setup the UI for the current puzzle
     */
    setupPuzzle() {
        // Set the current word
        this.currentWord = this.currentPuzzle.word.toUpperCase();
        
        // Load the images
        this.loadPuzzleImages();
        
        // Create letter spaces for the word
        this.createWordDisplay();
        
        // Generate the letter bank
        this.generateLetterBank();
        
        // Start the timer
        this.startTimer();
    }

    /**
     * Load the puzzle images into the UI
     */
    loadPuzzleImages() {
        const images = this.currentPuzzle.images;
        
        // Load images or use placeholders if not available
        for (let i = 0; i < 4; i++) {
            // Try to use the actual image, fallback to placeholder if not available
            const imageUrl = images[i] || PLACEHOLDER_IMAGES[i];
            
            // Set the background image for each cell
            this.imageElements[i].style.backgroundImage = `url('${imageUrl}')`;
            
            // Create an image object to preload and handle errors
            const img = new Image();
            img.onerror = () => {
                // On error, use the placeholder
                this.imageElements[i].style.backgroundImage = `url('${PLACEHOLDER_IMAGES[i]}')`;
            };
            img.src = imageUrl;
        }
    }

    /**
     * Create the display area for the word to guess
     */
    createWordDisplay() {
        // Clear existing content
        this.wordDisplay.innerHTML = "";
        
        // Create letter spaces for each character in the word
        for (let i = 0; i < this.currentWord.length; i++) {
            const letterSpace = document.createElement("div");
            letterSpace.className = "letter-space";
            letterSpace.dataset.index = i;
            this.wordDisplay.appendChild(letterSpace);
        }
    }

    /**
     * Generate the letter bank with the solution letters and additional random letters
     */
    generateLetterBank() {
        // Clear existing content
        this.letterBankElement.innerHTML = "";
        
        // Create array with all letters from the answer
        this.letterBank = this.currentWord.split("");
        
        // Add random extra letters
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < CONFIG.extraLetters; i++) {
            let randomLetter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            this.letterBank.push(randomLetter);
        }
        
        // Shuffle the letter bank
        this.letterBank = this.shuffleArray(this.letterBank);
        
        // Create letter buttons in the UI
        this.letterBank.forEach((letter, index) => {
            const letterButton = document.createElement("div");
            letterButton.className = "letter-button";
            letterButton.textContent = letter;
            letterButton.dataset.index = index;
            letterButton.dataset.letter = letter;
            
            // Add click event to handle letter selection
            letterButton.addEventListener("click", () => this.handleLetterClick(letterButton, index));
            
            this.letterBankElement.appendChild(letterButton);
        });
    }

    /**
     * Handle click on a letter in the letter bank
     * @param {HTMLElement} letterButton - The letter button element
     * @param {number} index - Index of the letter in the letterBank array
     */
    handleLetterClick(letterButton, index) {
        // Check if the letter is already selected or if word is already complete
        if (letterButton.classList.contains("selected") || this.userGuess.length >= this.currentWord.length) {
            return;
        }
        
        // Mark the letter as selected
        letterButton.classList.add("selected");
        
        // Add the letter to the user's guess
        this.userGuess.push({
            letter: this.letterBank[index],
            buttonElement: letterButton
        });
        
        // Update the word display
        this.updateWordDisplay();
        
        // Check if the word is complete
        if (this.userGuess.length === this.currentWord.length) {
            this.checkAnswer();
        }
    }

    /**
     * Update the word display with the user's current guess
     */
    updateWordDisplay() {
        // Get all letter spaces
        const letterSpaces = this.wordDisplay.querySelectorAll(".letter-space");
        
        // Clear all letter spaces
        letterSpaces.forEach(space => {
            space.textContent = "";
        });
        
        // Fill in the letter spaces with the user's guess
        this.userGuess.forEach((item, index) => {
            if (index < letterSpaces.length) {
                letterSpaces[index].textContent = item.letter;
            }
        });
    }

    /**
     * Check if the user's answer is correct
     */
    checkAnswer() {
        // Construct the user's answer from the guessed letters
        const userAnswer = this.userGuess.map(item => item.letter).join("");
        
        // Compare with the correct word
        if (userAnswer === this.currentWord) {
            // Correct answer
            this.handleCorrectAnswer();
        } else {
            // Incorrect answer
            this.handleIncorrectAnswer();
        }
    }

    /**
     * Handle correct answer
     */
    handleCorrectAnswer() {
        // Stop the timer
        clearInterval(this.gameTimer);
        
        // Show success message
        this.showFeedback("Correct! Well done!", "success");
        
        // Calculate score
        this.calculateScore();
        
        // Show the completion modal after a short delay
        setTimeout(() => {
            this.showCompletionModal(true);
        }, 1500);
    }

    /**
     * Handle incorrect answer
     */
    handleIncorrectAnswer() {
        // Show error message
        this.showFeedback("That's not correct. Try again!", "error");
        
        // Clear the user's guess
        this.userGuess.forEach(item => {
            item.buttonElement.classList.remove("selected");
        });
        this.userGuess = [];
        
        // Update the word display
        this.updateWordDisplay();
    }

    /**
     * Use a hint to reveal a letter
     */
    useHint() {
        // Check if any hints are left
        if (this.hintsUsed >= CONFIG.hintsAllowed) {
            this.showFeedback("No more hints available!", "error");
            return;
        }
        
        // Find a letter position that hasn't been revealed yet
        const letterSpaces = this.wordDisplay.querySelectorAll(".letter-space");
        const emptyPositions = [];
        
        for (let i = 0; i < this.currentWord.length; i++) {
            if (i >= this.userGuess.length) {
                emptyPositions.push(i);
            }
        }
        
        // If there are no empty positions, return
        if (emptyPositions.length === 0) {
            return;
        }
        
        // Choose a random empty position
        const randomPosition = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        const correctLetter = this.currentWord[randomPosition];
        
        // Find this letter in the letter bank that isn't already selected
        const availableButtons = Array.from(this.letterBankElement.querySelectorAll(".letter-button:not(.selected)"));
        const targetButton = availableButtons.find(button => button.dataset.letter === correctLetter);
        
        if (targetButton) {
            // Simulate clicking the letter
            targetButton.click();
            
            // Increment the hints used
            this.hintsUsed++;
            
            // Show feedback
            this.showFeedback(`Hint used! (${CONFIG.hintsAllowed - this.hintsUsed} remaining)`, "info");
        }
    }

    /**
     * Skip the current puzzle
     */
    skipPuzzle() {
        // Show the completion modal with skip message
        this.showCompletionModal(false);
    }

    /**
     * Start the game timer
     */
    startTimer() {
        // Reset timer
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.updateTimerDisplay();
        
        // Start the interval
        this.gameTimer = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimerDisplay();
        }, 1000);
    }

    /**
     * Update the timer display
     */
    updateTimerDisplay() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Calculate the score for the current puzzle
     */
    calculateScore() {
        // Base score for solving the puzzle
        let puzzleScore = CONFIG.basePointsPerPuzzle;
        
        // Deduct points for time taken (if enabled)
        if (CONFIG.timerEnabled) {
            puzzleScore -= Math.min(puzzleScore - 10, this.elapsedTime * CONFIG.timePenalty);
        }
        
        // Deduct points for hints used
        puzzleScore -= this.hintsUsed * CONFIG.hintPenalty;
        
        // Ensure score is never negative
        puzzleScore = Math.max(0, puzzleScore);
        
        // Add to total score
        this.score += puzzleScore;
        
        // Update the score display
        this.updateScoreDisplay();
        
        return puzzleScore;
    }

    /**
     * Update the score display on the UI
     */
    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
    }

    /**
     * Show the game completion modal
     * @param {boolean} success - Whether the puzzle was solved successfully
     */
    showCompletionModal(success) {
        const modal = document.getElementById("game-complete-modal");
        const resultMessage = document.getElementById("result-message");
        const completionTime = document.getElementById("completion-time");
        const finalScore = document.getElementById("final-score");
        const hintsUsed = document.getElementById("hints-used");
        const nextPuzzleBtn = document.getElementById("next-puzzle-btn");
        
        // Set the result message
        if (success) {
            resultMessage.textContent = "Congratulations!";
            const minutes = Math.floor(this.elapsedTime / 60);
            const seconds = this.elapsedTime % 60;
            completionTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            finalScore.textContent = this.score;
            hintsUsed.textContent = this.hintsUsed;
        } else {
            resultMessage.textContent = "Puzzle Skipped";
            completionTime.textContent = "N/A";
            finalScore.textContent = "0";
            hintsUsed.textContent = this.hintsUsed;
        }
        
        // Setup the next puzzle button
        nextPuzzleBtn.onclick = () => {
            modal.classList.remove("active");
            this.loadNextPuzzle();
        };
        
        // Show the modal
        modal.classList.add("active");
        
        // Close button functionality
        modal.querySelector(".close-modal").onclick = () => {
            modal.classList.remove("active");
        };
    }

    /**
     * Show feedback message to the user
     * @param {string} message - The message to display
     * @param {string} type - Type of message: "success", "error", or "info"
     */
    showFeedback(message, type) {
        this.feedbackElement.textContent = message;
        this.feedbackElement.className = "feedback-message";
        
        if (type) {
            this.feedbackElement.classList.add(type);
        }
        
        // Clear the message after a delay
        setTimeout(() => {
            this.feedbackElement.textContent = "";
            this.feedbackElement.className = "feedback-message";
        }, 3000);
    }

    /**
     * Show an error message
     * @param {string} message - The error message to display
     */
    showError(message) {
        this.showFeedback(message, "error");
    }

    /**
     * Shuffle an array randomly
     * @param {Array} array - The array to shuffle
     * @returns {Array} - The shuffled array
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
}

// User profile management
class UserManager {
    constructor() {
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
        
        // Try to load user data from local storage
        this.loadUserData();
    }

    /**
     * Load user data from localStorage
     */
    loadUserData() {
        const savedUser = localStorage.getItem("4pics1word_user");
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                this.currentUser = userData;
                this.updateProfileUI();
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        }
    }

    /**
     * Save user data to localStorage
     */
    saveUserData() {
        localStorage.setItem("4pics1word_user", JSON.stringify(this.currentUser));
    }

    /**
     * Update user stats after a game
     * @param {boolean} won - Whether the game was won
     * @param {number} score - The score for the game
     * @param {number} hintsUsed - Number of hints used
     * @param {number} timeTaken - Time taken to solve in seconds
     */
    updateStats(won, score, hintsUsed, timeTaken) {
        // Update games played
        this.currentUser.stats.gamesPlayed++;
        
        if (won) {
            // Update games won
            this.currentUser.stats.gamesWon++;
            
            // Update streak
            this.currentUser.stats.currentStreak++;
            
            // Update best streak if current streak is better
            if (this.currentUser.stats.currentStreak > this.currentUser.stats.bestStreak) {
                this.currentUser.stats.bestStreak = this.currentUser.stats.currentStreak;
            }
            
            // Check for achievements
            this.checkAchievements(won, hintsUsed, timeTaken);
        } else {
            // Reset streak on loss
            this.currentUser.stats.currentStreak = 0;
        }
        
        // Save and update UI
        this.saveUserData();
        this.updateProfileUI();
    }

    /**
     * Check for new achievements
     * @param {boolean} won - Whether the game was won
     * @param {number} hintsUsed - Number of hints used
     * @param {number} timeTaken - Time taken to solve in seconds
     */
    checkAchievements(won, hintsUsed, timeTaken) {
        if (!won) return;
        
        // Check for achievements based on the current status
        ACHIEVEMENTS.forEach(achievement => {
            // Skip if already achieved
            if (this.currentUser.achievements.includes(achievement.id)) {
                return;
            }
            
            let achieved = false;
            
            switch (achievement.id) {
                case "first_win":
                    achieved = this.currentUser.stats.gamesWon >= achievement.requirement;
                    break;
                case "streak_3":
                case "streak_7":
                    achieved = this.currentUser.stats.currentStreak >= achievement.requirement;
                    break;
                case "no_hints":
                    // This would need to track consecutive games without hints
                    // Simplified for this example
                    achieved = hintsUsed === 0;
                    break;
                case "speed_demon":
                    achieved = timeTaken <= achievement.requirement;
                    break;
                // More achievements would be checked here
            }
            
            if (achieved) {
                this.currentUser.achievements.push(achievement.id);
                this.showAchievementNotification(achievement);
            }
        });
    }

    /**
     * Show a notification for a new achievement
     * @param {Object} achievement - The achievement that was earned
     */
    showAchievementNotification(achievement) {
        // Create achievement notification (simplified)
        alert(`Achievement Unlocked: ${achievement.name}!\n${achievement.description}`);
    }

    /**
     * Update the profile UI with user data
     */
    updateProfileUI() {
        // Update username display
        document.getElementById("username").textContent = this.currentUser.username;
        
        // Update stats
        document.getElementById("games-played").textContent = this.currentUser.stats.gamesPlayed;
        document.getElementById("games-won").textContent = this.currentUser.stats.gamesWon;
        document.getElementById("current-streak").textContent = this.currentUser.stats.currentStreak;
        document.getElementById("best-streak").textContent = this.currentUser.stats.bestStreak;
        
        // Update achievements
        this.updateAchievementsUI();
    }

    /**
     * Update the achievements UI
     */
    updateAchievementsUI() {
        const achievementsContainer = document.getElementById("achievements-list");
        achievementsContainer.innerHTML = "";
        
        // Add each achievement to the UI
        ACHIEVEMENTS.forEach(achievement => {
            const isUnlocked = this.currentUser.achievements.includes(achievement.id);
            
            const achievementCard = document.createElement("div");
            achievementCard.className = isUnlocked ? "achievement-card" : "achievement-card achievement-locked";
            
            const iconElement = document.createElement("div");
            iconElement.className = "achievement-icon";
            iconElement.innerHTML = `<i class="fas fa-${achievement.icon}"></i>`;
            
            const nameElement = document.createElement("div");
            nameElement.className = "achievement-name";
            nameElement.textContent = achievement.name;
            
            const descElement = document.createElement("div");
            descElement.className = "achievement-desc";
            descElement.textContent = achievement.description;
            
            achievementCard.appendChild(iconElement);
            achievementCard.appendChild(nameElement);
            achievementCard.appendChild(descElement);
            
            achievementsContainer.appendChild(achievementCard);
        });
    }

    /**
     * Attempt to log in a user
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {boolean} - Success status
     */
    login(email, password) {
        // In a real application, this would verify credentials with a server
        // For this demo, we'll simulate a successful login
        this.currentUser.isLoggedIn = true;
        this.currentUser.username = email.split("@")[0]; // Use part of email as username
        this.saveUserData();
        this.updateProfileUI();
        return true;
    }

    /**
     * Register a new user
     * @param {string} username - User's chosen username
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {boolean} - Success status
     */
    register(username, email, password) {
        // In a real application, this would create an account on the server
        // For this demo, we'll simulate a successful registration
        this.currentUser = {
            isLoggedIn: true,
            username: username,
            email: email,
            stats: {
                gamesPlayed: 0,
                gamesWon: 0,
                currentStreak: 0,
                bestStreak: 0
            },
            achievements: []
        };
        
        this.saveUserData();
        this.updateProfileUI();
        return true;
    }

    /**
     * Log out the current user
     */
    logout() {
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
    }
}

// Leaderboard management
class LeaderboardManager {
    constructor() {
        this.leaderboardData = SAMPLE_LEADERBOARD;
        this.currentTab = "daily";
    }

    /**
     * Load leaderboard data
     * @param {string} timeframe - "daily", "weekly", or "allTime"
     */
    loadLeaderboard(timeframe) {
        // In a real application, this would fetch from a server
        // For this demo, we'll use the sample data
        this.currentTab = timeframe;
        this.updateLeaderboardUI();
    }

    /**
     * Update the leaderboard UI
     */
    updateLeaderboardUI() {
        const leaderboardContainer = document.getElementById("leaderboard-data");
        leaderboardContainer.innerHTML = "";
        
        // Get the correct data based on the tab
        let data;
        if (this.currentTab === "daily") {
            data = this.leaderboardData.daily;
        } else if (this.currentTab === "weekly") {
            data = this.leaderboardData.weekly;
        } else {
            data = this.leaderboardData.allTime;
        }
        
        // Create the leaderboard entries
        data.forEach(entry => {
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
            
            leaderboardContainer.appendChild(entryElement);
        });
    }

    /**
     * Submit a score to the leaderboard
     * @param {string} username - User's username
     * @param {number} score - User's score
     * @param {string} timeframe - "daily", "weekly", or "allTime"
     */
    submitScore(username, score, timeframe) {
        // In a real application, this would send the score to a server
        // For this demo, we'll just log it
        console.log(`Score submitted: ${username} - ${score} (${timeframe})`);
    }
}
