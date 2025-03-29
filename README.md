# 4 Pictures 1 Word Game

A modern, responsive web-based game where players are presented with four images and must guess the common word that connects them. Inspired by the popular mobile game, this web version includes daily challenges, categories, leaderboards, and achievements.

## Features

- **Multiple Game Modes**:
  - Daily Challenge (same puzzle for everyone each day)
  - Category-based challenges (Movies, Games, Sports, etc.)
  - Unlimited random puzzles

- **User Accounts** with Google Authentication:
  - Player profiles with statistics
  - Achievement system
  - Persistent game progress

- **Social Features**:
  - Global leaderboards (daily, weekly, and all-time)
  - Score sharing
  - Friend leaderboards (coming soon)

- **Progressive Web App (PWA)**:
  - Works offline
  - Installable on mobile devices
  - Push notifications for daily challenges (coming soon)

- **Dynamic Image System**:
  - Fetches relevant images from Pixabay API
  - Local caching for performance
  - Automatic fallbacks for missing images

## Project Architecture

### Frontend
- HTML5, CSS3, JavaScript (vanilla)
- Service Worker for offline functionality
- IndexedDB for local storage

### Backend (Cloudflare Workers)
- Serverless architecture
- KV storage for leaderboards and user data
- OAuth integration for Google Authentication

### External APIs
- Pixabay API for image sourcing
- Google OAuth for authentication

## Setup Instructions

### Prerequisites
- Cloudflare account
- Google Cloud Platform account
- Pixabay API key
- Node.js and npm (for local development)
- Wrangler CLI (Cloudflare Workers CLI)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/4pics1word-game.git
   cd 4pics1word-game
   ```

2. **Configure API Keys**

   Create a `.env` file in the project root:
   ```
   PIXABAY_API_KEY=your_pixabay_api_key
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```

3. **Update Service API Keys**

   Edit the following files with your API keys:
   - `js/imageService.js`: Replace `YOUR_PIXABAY_API_KEY` with your actual Pixabay API key
   - `js/authService.js`: Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your Google OAuth client ID

4. **Install development dependencies**
   ```bash
   npm install
   ```

5. **Run local development server**
   ```bash
   npm run dev
   ```

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the consent screen with your app information
6. Select "Web application" as the application type
7. Add authorized JavaScript origins:
   - `http://localhost:8080` (for local development)
   - Your production domain (e.g., `https://4pics1word-game.yourdomain.com`)
8. Save and copy the generated Client ID

### Pixabay API Setup

1. Create an account on [Pixabay](https://pixabay.com/)
2. Get your API key from your account page
3. Insert the API key in the `imageService.js` file

### Cloudflare Workers Deployment

1. **Install Wrangler CLI**
   ```bash
   npm install -g @cloudflare/wrangler
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```

3. **Create KV Namespaces**
   ```bash
   wrangler kv:namespace create "LEADERBOARD"
   wrangler kv:namespace create "USER_DATA"
   wrangler kv:namespace create "PUZZLES"
   ```

4. **Update Wrangler Configuration**

   Edit `wrangler.toml` with your Cloudflare account ID and KV namespace IDs:
   ```toml
   account_id = "your_cloudflare_account_id"
   
   [kv_namespaces]
     [[kv_namespaces]]
     binding = "LEADERBOARD"
     id = "your_leaderboard_namespace_id"

     [[kv_namespaces]]
     binding = "USER_DATA"
     id = "your_user_data_namespace_id"

     [[kv_namespaces]]
     binding = "PUZZLES"
     id = "your_puzzles_namespace_id"
   ```

5. **Deploy to Cloudflare Workers**
   ```bash
   wrangler publish
   ```

6. **Configure Custom Domain (Optional)**

   In the Cloudflare dashboard:
   - Go to Workers & Pages
   - Select your worker
   - Click "Add Custom Domain"
   - Follow the instructions to set up your domain

## Project Structure

```
4pics1word-game/
├── index.html               # Main HTML file
├── manifest.json            # PWA manifest
├── service-worker.js        # Service worker for offline functionality
├── README.md                # This file
├── 4PicsOneWord_ProjectPlan.md  # Detailed project plan
├── css/
│   └── style.css            # Main stylesheet
├── js/
│   ├── app.js               # Main application logic
│   ├── authService.js       # Google Authentication service
│   ├── data.js              # Game data and configurations
│   ├── gameLogic.js         # Core game functionality
│   ├── imageService.js      # Image management with Pixabay
│   └── leaderboardService.js # Leaderboard functionality
├── assets/
│   ├── images/              # Game images and icons
│   ├── fonts/               # Custom fonts
│   └── data/                # JSON data files
└── cloudflare/
    ├── wrangler.toml        # Cloudflare Workers configuration
    └── workers-site/
        └── index.js         # Cloudflare Workers backend code
```

## Security Considerations

- API keys are processed server-side in Cloudflare Workers
- Google Authentication uses the OAuth 2.0 protocol
- User data is stored securely in Cloudflare KV storage
- All API requests are authenticated with JWT tokens

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Pixabay](https://pixabay.com/) for providing the image API
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2) for authentication
- [Cloudflare Workers](https://workers.cloudflare.com/) for serverless hosting
- [Font Awesome](https://fontawesome.com/) for icons
- [Poppins](https://fonts.google.com/specimen/Poppins) font from Google Fonts
