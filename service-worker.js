/**
 * 4 Pictures 1 Word - Service Worker
 * Handles offline caching and PWA functionality
 */

const CACHE_NAME = '4pics1word-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/data.js',
  '/js/gameLogic.js',
  '/js/imageService.js',
  '/js/authService.js',
  '/js/leaderboardService.js',
  // Cache fonts and icons
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2'
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy for API requests
async function networkFirstWithCache(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try the network first
    const networkResponse = await fetch(request);
    
    // Cache the response (only if successful)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try the cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If nothing in cache either, return a fallback for certain requests
    if (request.url.includes('/api/puzzles/') || request.url.includes('/api/leaderboard/')) {
      return new Response(
        JSON.stringify({ 
          error: 'offline', 
          message: 'You are currently offline. Please check your connection.' 
        }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 503
        }
      );
    }
    
    // Otherwise, propagate the error
    throw error;
  }
}

// Cache-first strategy for static assets
async function cacheFirstWithNetwork(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // If found in cache, return it
    return cachedResponse;
  }
  
  // Otherwise fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache the response for next time
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If fetch fails and it's an image, return a placeholder
    if (request.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return caches.match('/assets/images/placeholder.png');
    }
    
    // Otherwise, propagate the error
    throw error;
  }
}

// Handle fetch events
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (requestUrl.origin !== location.origin && !event.request.url.includes('cloudflare-cdn.com')) {
    return;
  }
  
  // For API requests, use network first strategy
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(event.request));
    return;
  }
  
  // For static assets, use cache first strategy
  if (
    requestUrl.pathname.match(/\.(html|css|js|json|jpg|jpeg|png|gif|webp|ico|woff|woff2)$/i) ||
    ASSETS_TO_CACHE.includes(requestUrl.pathname)
  ) {
    event.respondWith(cacheFirstWithNetwork(event.request));
    return;
  }
  
  // For other requests, just fetch from network
  event.respondWith(
    fetch(event.request).catch((error) => {
      console.error('Fetch error:', error);
      
      // Check if it's a navigation request
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
      
      throw error;
    })
  );
});

// Handle background sync for offline score submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'submit-scores') {
    event.waitUntil(syncScores());
  }
});

// Function to sync pending scores
async function syncScores() {
  try {
    // Get pending scores from IndexedDB
    const pendingScores = await getPendingScores();
    
    if (!pendingScores || pendingScores.length === 0) {
      return;
    }
    
    // Try to submit each score
    const submissionPromises = pendingScores.map(async (scoreData) => {
      try {
        const response = await fetch(`/api/leaderboard/${scoreData.timeframe}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${scoreData.token}`
          },
          body: JSON.stringify({
            score: scoreData.score,
            puzzleId: scoreData.puzzleId
          })
        });
        
        if (response.ok) {
          // If successful, remove from pending
          await removePendingScore(scoreData.id);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Error syncing score:', error);
        return false;
      }
    });
    
    await Promise.all(submissionPromises);
  } catch (error) {
    console.error('Error in syncScores:', error);
  }
}

// IndexedDB functions for pending scores (simplified)
function getPendingScores() {
  // This would normally use IndexedDB
  // For simplicity, we'll use localStorage in this example
  try {
    const pendingScores = localStorage.getItem('4pics1word_pending_scores');
    return pendingScores ? JSON.parse(pendingScores) : [];
  } catch (error) {
    console.error('Error getting pending scores:', error);
    return [];
  }
}

function removePendingScore(id) {
  try {
    const pendingScores = getPendingScores();
    const updatedScores = pendingScores.filter(score => score.id !== id);
    localStorage.setItem('4pics1word_pending_scores', JSON.stringify(updatedScores));
  } catch (error) {
    console.error('Error removing pending score:', error);
  }
}
