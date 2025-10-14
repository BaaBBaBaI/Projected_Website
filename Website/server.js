import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// API endpoint to get a single random cat URL
app.get('/api/random-cat', (_req, res) => {
    const isGif = Math.random() > 0.5;
    const stamp = Date.now();
    const url = isGif
        ? `https://cataas.com/cat/gif?random=${stamp}`
        : `https://cataas.com/cat?width=400&random=${stamp}`;
    res.json({ url });
});

// IMPORTANT: Bind to 0.0.0.0 for Render (not localhost)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

