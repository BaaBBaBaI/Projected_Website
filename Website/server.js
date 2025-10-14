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

// The gallery endpoint is no longer needed.

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
