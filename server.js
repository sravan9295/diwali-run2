import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set port (use environment variable or default to 3000)
const PORT = process.env.PORT || 3000;

// Serve static files from the built client directory
app.use(express.static(path.join(__dirname, 'dist/client')));

// CORS headers for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Route for the main game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/client/index.html'));
});

// Route for the game (alternative path)
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/client/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        game: 'Diwali Night Runner',
        version: '1.0.0'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🪔 Diwali Night Runner Server Started!');
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`🎮 Game URL: http://localhost:${PORT}/game`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('🚀 Ready to play! Open the URL in your browser.');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

export default app;