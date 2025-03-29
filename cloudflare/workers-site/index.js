/**
 * Cloudflare Worker for 4 Pictures 1 Word game
 * Handles API requests, authentication, and serves the static site
 */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { Router } from 'itty-router'

// Create a new router
const router = Router()

// KV Namespace bindings will be injected by Cloudflare
// LEADERBOARD: KV Namespace for leaderboard data
// USER_DATA: KV Namespace for user data
// JWT_SECRET: Secret for verifying Google auth tokens

// Regular expression for API routes
const apiRoutePattern = /^\/api\/.*$/

// Helper function to verify Google auth token
async function verifyGoogleToken(token) {
  try {
    // In production, you would verify the token with Google's API
    // For now, we'll do a simplified check
    if (!token) return null
    
    // Make request to Google's tokeninfo endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return {
      id: data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// Middleware to verify authentication for protected routes
async function authMiddleware(request) {
  // Skip auth for non-API or public API routes
  if (!apiRoutePattern.test(request.url.pathname) || 
      request.url.pathname.includes('/api/public/')) {
    return
  }
  
  // Get auth token from header
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  const token = authHeader.split(' ')[1]
  const user = await verifyGoogleToken(token)
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Add user to request object for use in route handlers
  request.user = user
}

// Route to get daily puzzle
router.get('/api/puzzles/daily', async (request) => {
  const today = new Date()
  const dateString = `${today.getFullYear()}${today.getMonth()}${today.getDate()}`
  
  // In production, you would fetch this from KV storage
  // Here we're computing it based on the date for consistency
  
  // Generate a puzzle based on the date (simplified version)
  // You would replace this with actual puzzle data from KV
  
  return new Response(JSON.stringify({
    date: today.toISOString().split('T')[0],
    puzzleId: `daily_${dateString}`
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// Route to get user profile
router.get('/api/user/profile', async (request) => {
  // User will be added by auth middleware
  const user = request.user
  
  // In production, you would fetch additional user data from KV storage
  // For now, return basic profile info
  
  return new Response(JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    picture: user.picture
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// Route to get user stats
router.get('/api/user/stats', async (request) => {
  const user = request.user
  
  // In production, fetch from USER_DATA KV namespace
  // For now, return placeholder data
  
  return new Response(JSON.stringify({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    bestStreak: 0,
    achievements: []
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// Route to update user stats
router.post('/api/user/stats', async (request) => {
  const user = request.user
  
  // Parse request body
  const body = await request.json()
  
  // In production, you would validate and store in KV
  // For this example, we'll just acknowledge receipt
  
  return new Response(JSON.stringify({
    success: true,
    message: 'Stats updated'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// Routes for leaderboard
router.get('/api/leaderboard/:timeframe', async (request, { params }) => {
  const { timeframe } = params
  const validTimeframes = ['daily', 'weekly', 'allTime']
  
  if (!validTimeframes.includes(timeframe)) {
    return new Response(JSON.stringify({ error: 'Invalid timeframe' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // In production, fetch from LEADERBOARD KV namespace
  // For now, return placeholder data
  
  const leaderboardData = Array(10).fill(0).map((_, i) => ({
    rank: i + 1,
    username: `Player${i + 1}`,
    score: Math.floor(1000 - i * 50 + Math.random() * 30)
  }))
  
  return new Response(JSON.stringify(leaderboardData), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// Submit score to leaderboard
router.post('/api/leaderboard/:timeframe', async (request, { params }) => {
  const user = request.user
  const { timeframe } = params
  const validTimeframes = ['daily', 'weekly', 'allTime']
  
  if (!validTimeframes.includes(timeframe)) {
    return new Response(JSON.stringify({ error: 'Invalid timeframe' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // Parse request body
  const body = await request.json()
  const { score } = body
  
  if (typeof score !== 'number') {
    return new Response(JSON.stringify({ error: 'Invalid score' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // In production, you would validate and store in KV
  // Here we just acknowledge
  
  return new Response(JSON.stringify({
    success: true,
    message: 'Score submitted'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// Catch-all route to serve static assets
router.all('*', async (request, event) => {
  try {
    return await getAssetFromKV(event)
  } catch (e) {
    return new Response('Not Found', { status: 404 })
  }
})

// Main handler function
async function handleRequest(event) {
  const request = event.request
  
  // Check for API requests that need authentication
  if (apiRoutePattern.test(new URL(request.url).pathname)) {
    const authResult = await authMiddleware(request)
    if (authResult instanceof Response) {
      return authResult
    }
  }
  
  // Route the request
  return router.handle(request, event)
}

// Register event handler
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})
