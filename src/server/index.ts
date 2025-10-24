// Minimal Devvit server - the game runs entirely client-side
// This file exists to satisfy Devvit's architecture requirements

export default function handler() {
  // The Three.js game runs entirely in the client
  // No server-side logic needed for this implementation
  return new Response('Diwali Night Runner Server', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}