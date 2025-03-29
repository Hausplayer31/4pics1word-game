/**
 * 4 Pictures 1 Word - Game Data
 * Contains all the puzzle data, categories, and game configuration
 */

// Game Configuration
const CONFIG = {
    // General settings
    hintsAllowed: 3,
    basePointsPerPuzzle: 100,
    timePenalty: 5, // Points deducted per second
    hintPenalty: 20, // Points deducted per hint

    // Timer settings
    timerEnabled: true,
    timeLimit: 0, // 0 means no time limit

    // Letter bank settings
    extraLetters: 6, // Number of extra letters to add
};

// Categories
const CATEGORIES = {
    daily: {
        name: "Daily Challenge",
        icon: "calendar-day",
        description: "A new puzzle every day for everyone"
    },
    movies: {
        name: "Movies & TV",
        icon: "film",
        description: "Film and television related words"
    },
    games: {
        name: "Video Games",
        icon: "gamepad",
        description: "Gaming related words and characters"
    },
    sports: {
        name: "Sports",
        icon: "futbol",
        description: "Sports and athleticism"
    },
    animals: {
        name: "Animals",
        icon: "paw",
        description: "Animals and wildlife"
    },
    food: {
        name: "Food & Drinks",
        icon: "utensils",
        description: "Culinary delights"
    },
    geography: {
        name: "Geography",
        icon: "globe-americas",
        description: "Places and landmarks"
    },
    people: {
        name: "Famous People",
        icon: "user-tie",
        description: "Celebrities and historical figures"
    },
    music: {
        name: "Music",
        icon: "music",
        description: "Musical terms and artists"
    }
};

// Achievement definitions
const ACHIEVEMENTS = [
    {
        id: "first_win",
        name: "First Victory",
        description: "Solve your first puzzle",
        icon: "trophy",
        requirement: 1 // Number of wins
    },
    {
        id: "streak_3",
        name: "On Fire",
        description: "Solve 3 puzzles in a row",
        icon: "fire",
        requirement: 3 // Streak length
    },
    {
        id: "streak_7",
        name: "Unstoppable",
        description: "Solve 7 puzzles in a row",
        icon: "fire-alt",
        requirement: 7 // Streak length
    },
    {
        id: "no_hints",
        name: "Clear Mind",
        description: "Solve 5 puzzles without using hints",
        icon: "lightbulb",
        requirement: 5 // Puzzles without hints
    },
    {
        id: "speed_demon",
        name: "Speed Demon",
        description: "Solve a puzzle in under 10 seconds",
        icon: "tachometer-alt",
        requirement: 10 // Time in seconds
    },
    {
        id: "completionist",
        name: "Completionist",
        description: "Solve puzzles from all categories",
        icon: "check-double",
        requirement: Object.keys(CATEGORIES).length - 1 // All categories (excluding daily)
    }
];

// Sample puzzle data
// In a production environment, this would likely be fetched from a database or API
const PUZZLES = {
    movies: [
        {
            id: "mov_001",
            word: "ACTOR",
            images: [
                "assets/images/puzzles/movies/actor_1.jpg",
                "assets/images/puzzles/movies/actor_2.jpg",
                "assets/images/puzzles/movies/actor_3.jpg",
                "assets/images/puzzles/movies/actor_4.jpg"
            ],
            difficulty: 1
        },
        {
            id: "mov_002",
            word: "SCENE",
            images: [
                "assets/images/puzzles/movies/scene_1.jpg",
                "assets/images/puzzles/movies/scene_2.jpg",
                "assets/images/puzzles/movies/scene_3.jpg",
                "assets/images/puzzles/movies/scene_4.jpg"
            ],
            difficulty: 1
        },
        {
            id: "mov_003",
            word: "OSCAR",
            images: [
                "assets/images/puzzles/movies/oscar_1.jpg",
                "assets/images/puzzles/movies/oscar_2.jpg",
                "assets/images/puzzles/movies/oscar_3.jpg",
                "assets/images/puzzles/movies/oscar_4.jpg"
            ],
            difficulty: 2
        }
    ],
    games: [
        {
            id: "gam_001",
            word: "LEVEL",
            images: [
                "assets/images/puzzles/games/level_1.jpg",
                "assets/images/puzzles/games/level_2.jpg",
                "assets/images/puzzles/games/level_3.jpg",
                "assets/images/puzzles/games/level_4.jpg"
            ],
            difficulty: 1
        },
        {
            id: "gam_002",
            word: "SCORE",
            images: [
                "assets/images/puzzles/games/score_1.jpg",
                "assets/images/puzzles/games/score_2.jpg",
                "assets/images/puzzles/games/score_3.jpg",
                "assets/images/puzzles/games/score_4.jpg"
            ],
            difficulty: 1
        },
        {
            id: "gam_003",
            word: "MARIO",
            images: [
                "assets/images/puzzles/games/mario_1.jpg",
                "assets/images/puzzles/games/mario_2.jpg",
                "assets/images/puzzles/games/mario_3.jpg",
                "assets/images/puzzles/games/mario_4.jpg"
            ],
            difficulty: 2
        }
    ],
    sports: [
        {
            id: "spt_001",
            word: "GOAL",
            images: [
                "assets/images/puzzles/sports/goal_1.jpg",
                "assets/images/puzzles/sports/goal_2.jpg",
                "assets/images/puzzles/sports/goal_3.jpg",
                "assets/images/puzzles/sports/goal_4.jpg"
            ],
            difficulty: 1
        },
        {
            id: "spt_002",
            word: "TEAM",
            images: [
                "assets/images/puzzles/sports/team_1.jpg",
                "assets/images/puzzles/sports/team_2.jpg",
                "assets/images/puzzles/sports/team_3.jpg",
                "assets/images/puzzles/sports/team_4.jpg"
            ],
            difficulty: 1
        },
        {
            id: "spt_003",
            word: "MEDAL",
            images: [
                "assets/images/puzzles/sports/medal_1.jpg",
                "assets/images/puzzles/sports/medal_2.jpg",
                "assets/images/puzzles/sports/medal_3.jpg",
                "assets/images/puzzles/sports/medal_4.jpg"
            ],
            difficulty: 2
        }
    ],
    animals: [
        {
            id: "ani_001",
            word: "TIGER",
            images: [
                "assets/images/puzzles/animals/tiger_1.jpg",
                "assets/images/puzzles/animals/tiger_2.jpg",
                "assets/images/puzzles/animals/tiger_3.jpg",
                "assets/images/puzzles/animals/tiger_4.jpg"
            ],
            difficulty: 1
        },
        {
            id: "ani_002",
            word: "SHARK",
            images: [
                "assets/images/puzzles/animals/shark_1.jpg",
                "assets/images/puzzles/animals/shark_2.jpg",
                "assets/images/puzzles/animals/shark_3.jpg",
                "assets/images/puzzles/animals/shark_4.jpg"
            ],
            difficulty: 1
        },
        {
            id: "ani_003",
            word: "EAGLE",
            images: [
                "assets/images/puzzles/animals/eagle_1.jpg",
                "assets/images/puzzles/animals/eagle_2.jpg",
                "assets/images/puzzles/animals/eagle_3.jpg",
                "assets/images/puzzles/animals/eagle_4.jpg"
            ],
            difficulty: 2
        }
    ],
    food: [
        {
            id: "food_001",
            word: "PASTA",
            images: [
                "assets/images/puzzles/food/pasta_1.jpg",
                "assets/images/puzzles/food/pasta_2.jpg",
                "assets/images/puzzles/food/pasta_3.jpg",
                "assets/images/puzzles/food/pasta_4.jpg"
            ],
            difficulty: 1
        },
        {
            id: "food_002",
            word: "JUICE",
            images: [
                "assets/images/puzzles/food/juice_1.jpg",
                "assets/images/puzzles/food/juice_2.jpg",
                "assets/images/puzzles/food/juice_3.jpg",
                "assets/images/puzzles/food/juice_4.jpg"
            ],
            difficulty: 1
        },
        {
            id: "food_003",
            word: "CREAM",
            images: [
                "assets/images/puzzles/food/cream_1.jpg",
                "assets/images/puzzles/food/cream_2.jpg",
                "assets/images/puzzles/food/cream_3.jpg",
                "assets/images/puzzles/food/cream_4.jpg"
            ],
            difficulty: 2
        }
    ]
};

// Function to get a daily puzzle based on the date
function getDailyPuzzle() {
    // Get all puzzles from all categories
    const allPuzzles = [];
    for (const category in PUZZLES) {
        allPuzzles.push(...PUZZLES[category]);
    }

    // Use the date to select a puzzle (ensures everyone gets the same puzzle on a given day)
    const today = new Date();
    const dateString = `${today.getFullYear()}${today.getMonth()}${today.getDate()}`;
    const seed = parseInt(dateString, 10);
    
    // Simple seeded random number generation
    const randomIndex = seed % allPuzzles.length;
    
    return allPuzzles[randomIndex];
}

// Fallback placeholder images for development
const PLACEHOLDER_IMAGES = [
    "https://via.placeholder.com/300x300.png?text=Image+1",
    "https://via.placeholder.com/300x300.png?text=Image+2",
    "https://via.placeholder.com/300x300.png?text=Image+3",
    "https://via.placeholder.com/300x300.png?text=Image+4"
];

// Leaderboard data (sample data for initial development)
const SAMPLE_LEADERBOARD = {
    daily: [
        { rank: 1, username: "WordMaster", score: 950 },
        { rank: 2, username: "PuzzlePro", score: 920 },
        { rank: 3, username: "QuickGuesser", score: 875 },
        { rank: 4, username: "ImageExpert", score: 840 },
        { rank: 5, username: "WordWizard", score: 820 },
        { rank: 6, username: "PuzzleSolver", score: 790 },
        { rank: 7, username: "PicFinder", score: 760 },
        { rank: 8, username: "WordHunter", score: 730 },
        { rank: 9, username: "GuessMaster", score: 710 },
        { rank: 10, username: "PuzzleKing", score: 690 }
    ],
    weekly: [
        { rank: 1, username: "PuzzlePro", score: 8750 },
        { rank: 2, username: "WordMaster", score: 8200 },
        { rank: 3, username: "ImageExpert", score: 7600 },
        { rank: 4, username: "QuickGuesser", score: 7200 },
        { rank: 5, username: "WordWizard", score: 6800 },
        { rank: 6, username: "PuzzleSolver", score: 6500 },
        { rank: 7, username: "WordHunter", score: 6200 },
        { rank: 8, username: "PicFinder", score: 5900 },
        { rank: 9, username: "PuzzleKing", score: 5600 },
        { rank: 10, username: "GuessMaster", score: 5300 }
    ],
    allTime: [
        { rank: 1, username: "WordMaster", score: 52800 },
        { rank: 2, username: "PuzzlePro", score: 48600 },
        { rank: 3, username: "WordWizard", score: 43500 },
        { rank: 4, username: "ImageExpert", score: 39200 },
        { rank: 5, username: "QuickGuesser", score: 35700 },
        { rank: 6, username: "PuzzleSolver", score: 32100 },
        { rank: 7, username: "PuzzleKing", score: 29800 },
        { rank: 8, username: "WordHunter", score: 27500 },
        { rank: 9, username: "PicFinder", score: 24600 },
        { rank: 10, username: "GuessMaster", score: 21900 }
    ]
};
